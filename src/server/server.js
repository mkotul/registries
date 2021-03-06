'use strict';

var log = require('./logging.js').getLogger('server.js');
var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var path = require('path');
var fsController=require('./fsController.js');

var mongoDriver = require(path.join(process.cwd(), '/build/server/mongoDriver.js'));
var config = require(path.join(process.cwd(), '/build/server/config.js'));

var universalDaoControllerModule = require(process.cwd() + '/build/server/UniversalDaoController.js');

var securityControllerModule = require('./securityController.js');
var securityServiceModule = require('./securityService.js');
var securityService= new securityServiceModule.SecurityService();

var schemaRegistryModule = require('./schemaRegistry.js');

var searchControllerModule = require('./searchController.js');
var schemaControllerModule = require('./schemaController.js');
var statisticsControllerModule = require('./statisticsController.js');
var massmailingCotrollerModule = require('./massmailingController.js');

var app = express();

// setup request logging
app.use(require('./request-logger.js')
	.getLogger(require('./logging.js')
		.getLogger('HTTP'))
	.logger()
);
app.disable('view cache');

// Static data
app.use(express.static(path.join(process.cwd(), 'build', 'client')));

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}

	// Load and register schemas
	var schemasListPaths = JSON.parse(
		fs.readFileSync(path.join(config.paths.schemas, '_index.json')))
		.map(function(item) {
			return path.join(config.paths.schemas, item);
	});
	var schemaRegistry = new schemaRegistryModule.SchemaRegistry({schemasList:schemasListPaths});
	
	var udc = new universalDaoControllerModule.UniversalDaoController(mongoDriver, schemaRegistry);
	
	var securityCtrl= new  securityControllerModule.SecurityController(mongoDriver,schemaRegistry,config);
	
	var searchCtrl = new  searchControllerModule.SearchController(mongoDriver,schemaRegistry,{});
	var statisticsCtrl = new  statisticsControllerModule.StatisticsController(mongoDriver,{});
	var schemaCtrl = new  schemaControllerModule.SchemaController(mongoDriver,schemaRegistry,{
		rootPath: config.paths.schemas
	});

	var massmailingCtr= new massmailingCotrollerModule.MassmailingController(mongoDriver,{});
	
	app.use(cookieParser());
	app.use(securityCtrl.authFilter);
	
	app.put('/udao/save/:table',  securityService.authenRequired,bodyParser.json(), function(req, res){udc.save(req, res);});
	app.put('/udao/saveBySchema/:schema',securityService.authenRequired, bodyParser.json(), function(req, res){udc.saveBySchema(req, res);});
	app.get('/udao/get/:table/:id',securityService.authenRequired, bodyParser.json(), function(req, res){udc.get(req, res);});
	app.get('/udao/getBySchema/:schema/:id',securityService.authenRequired, function(req, res){udc.getBySchema(req, res);});
	app.get('/udao/list/:table',securityService.authenRequired, bodyParser.json(), function(req, res){udc.list(req, res);});
	app.get('/udao/listBySchema/:schema',securityService.authenRequired, bodyParser.json(), function(req, res){udc.listBySchema(req, res);});
	app.post('/udao/search/:table',securityService.authenRequired, bodyParser.json(), function(req, res){udc.search(req, res);});

	app.post('/login', bodyParser.json(), function(req, res){securityCtrl.login(req, res);});
	app.get('/logout', bodyParser.json(), function(req, res){securityCtrl.logout(req, res);});
	app.get('/user/current',securityService.authenRequired, bodyParser.json(), function(req, res){securityCtrl.getCurrentUser(req, res);});
	app.post('/user/profile',securityService.authenRequired, bodyParser.json(), function(req, res){securityCtrl.selectProfile(req, res);});
	
	app.post('/resetPassword',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req, res){securityCtrl.resetPassword(req, res);});
	app.post('/changePassword',securityService.hasPermFilter('System User').check, bodyParser.json(),function(req, res){securityCtrl.changePassword(req, res);});

	app.get('/security/permissions',securityService.authenRequired,function(req,res){securityCtrl.getPermissions(req,res);});
	app.get('/security/search/schemas',securityService.authenRequired,function(req,res){securityCtrl.getSearchSchemas(req,res);});
	app.post('/massmailing/send',securityService.hasPermFilter('Registry - write').check,bodyParser.json(),function(req,res){massmailingCtr.sendMail(req,res);});

	app.get('/statistics',securityService.hasPermFilter('Registry - read').check,function(req,res){statisticsCtrl.getStatistics(req,res);});

	app.get('/schema/compiled/*',securityService.hasPermFilter('System User').check,bodyParser.json(),function(req,res){schemaCtrl.getCompiledSchema(req,res);});
	app.get('/schema/ls*',securityService.hasPermFilter('System Admin').check,bodyParser.json(),function(req,res){schemaCtrl.schemaList(req,res);});
	app.get('/schema/get/*',securityService.hasPermFilter('System Admin').check,bodyParser.json(),function(req,res){schemaCtrl.schemaRead(req,res);});
	app.put('/schema/replace/*',securityService.hasPermFilter('System Admin').check,bodyParser.json(),function(req,res){schemaCtrl.schemaReplace(req,res);});

//    app.get('/user/list',function(req,res){userCtrl.getUserList(req,res)});
	app.get('/user/permissions/:id',securityService.hasPermFilter('Security - write').check,bodyParser.json(),function(req,res){securityCtrl.getUserPermissions(req,res);});
	app.post('/user/permissions/update',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req,res){securityCtrl.updateUserPermissions(req,res);});
	app.post('/user/security/update',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req,res){securityCtrl.updateUserSecurity(req,res);});
	app.post('/group/security/update',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req,res){securityCtrl.updateGroupSecurity(req,res);});
	app.post('/security/profile/update',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req,res){securityCtrl.updateSecurityProfile(req,res);});
	app.get('/security/profiles',securityService.authenRequired,function(req,res){securityCtrl.getProfiles(req,res);});

	app.post('/search/def',securityService.authenRequired, bodyParser.json(),function(req,res){searchCtrl.getSearchDef(req,res);});
	app.post('/search/:schema',securityService.authenRequired, bodyParser.json(),function(req,res){searchCtrl.search(req,res);});

	// Static data
//	app.use(express.static(path.join(process.cwd(), 'build', 'client')));

//	app.all('/my*',fsCtrl2.handle);
	
	app.use(express.static(__dirname + '/public'));
	app.use(errorhandler({ dumpExceptions: true, showStack: true }));
	
	log.verbose('Configuring photos sub applicaction');
	var photosRepoApp = fsController.create({rootPath: config.paths.photos ,fileFilter: null});
	app.use('/photos',photosRepoApp);

	log.verbose('Configuring dataset sub applicaction');
	var datasetRepoApp = fsController.create({
			rootPath:config.paths.dataset,
			allowedOperations: ['get'],
			fileFilter: null});
	app.use('/dataset',datasetRepoApp);
	
//	var server = app.listen(config.webserverPort || 3000, config.webserverHost || "0.0.0.0", function(){
//		log.info("Http server listening at %j", server.address(), {});
//	});
	

	if (process.env.REGISTRIES_PRODUCTION) {
		// We are in production environment, use only http port

		var port = config.webserverPort;
		var host = config.webserverHost;

		// Create an HTTP service.
		http.createServer(app)
		.listen(port, host, function() {
			log.info('Http server listening at %s:%s', host, port);
		});
	} else {
		// We are NOT in production environment, use https port

		var port = config.webserverSecurePort;
		var host = config.webserverHost;

		var sslKey =fs.readFileSync(path.join(process.cwd(), 'build', 'server', 'ssl', 'server.key'));
		var sslCert =fs.readFileSync(path.join(process.cwd(), 'build', 'server', 'ssl', 'server.crt'));

		var ssl = {
				key: sslKey.toString(),
				cert: sslCert.toString(),
				passphrase: 'changeit'
		};

		// Create an HTTPS service identical to the HTTP service.
		https.createServer(ssl, app)
		.listen(port, host, function(){
			log.info('Https (secure) server listening at %s:%s', host, port);
		});
	}
	
});
