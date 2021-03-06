'use strict';
angular.module('massmailing', ['schema-utils','pascalprecht.translate','schema-utils','generic-search'])
//
.factory('massmailing.MassmailingFactory', [ '$http', function($http) {
	var service = {};
	service.sendMail = function(template,criteria,users) {
		
		return $http({
			method : 'POST',
			url : '/massmailing/send',
			data : {
				criteria : criteria,
				template: template, 
				users: users
			}
		});
	};

	return service;
} ])
//
.controller('massmailing.editCtrl', [ '$scope', '$routeParams', 'schema-utils.SchemaUtilFactory','generic-search.GenericSearchFactory','psui.notificationFactory','schema-utils.SchemaUtilFactory','massmailing.MassmailingFactory',function($scope, $routeParams,SchemaUtilFactory,genericSearchFactory,notificationFactory,schemaUtilFactory,massmailingFactory) {
	
	var schemaUri='uri://registries/mailtemplates#master/view';
	var peopleSchemaUri='uri://registries/member';
	
	$scope.selectedTemplate={baseData:  { name: '', textTemplate: '', htmlTemplate: ''} };
	$scope.searchDef = {};
	$scope.searchCrit = [];
	$scope.data = [];
	$scope.headers = {};
	$scope.forcedCriterias = [];
	$scope.selectAll=true;

	var pageSize=20;

	schemaUtilFactory.getCompiledSchema(peopleSchemaUri, 'search').success(function(data) {

		$scope.schema=data;
		$scope.searchDef = genericSearchFactory.parseSearchDef(data);
		$scope.entity = data.title;

		$scope.addCrit(); 
		$scope.headers = data.listFields;
		$scope.sortBy={header: data.listFields[0] , direction : 'asc' };
		$scope.forcedCriterias = data.forcedCriterias || [];
	}).error(function(err) {
		notificationFactory.error(err);
	});


	
	function convertSortBy(searchBy){
		if (!searchBy)  {
			return null;
		}
		return [{ f:searchBy.header.field, o: searchBy.direction}];
	}


	function convertCriteria(crit) {

		var retval = [];

		crit.map(function(c) {
			if (c && c.attribute && c.attribute.path) {
				
				retval.push({
					f : c.attribute.path,
					v : c.value,
					op : c.operator.value
				});
			}
		});
		return retval;
	}


	$scope.addCrit = function() {
		$scope.searchCrit.push({});
	};
	
	$scope.removeCrit = function(index) {
		$scope.searchCrit.splice(index, 1);
	};

	SchemaUtilFactory.listBySchema(schemaUri).success(function(data){
		$scope.templates=data;
	});

	
	$scope.search = function() {
		var c = convertCriteria($scope.searchCrit);
		// add forced criteria
		for (var idx = 0; idx < $scope.forcedCriterias.length; idx++) {
			c.push($scope.forcedCriterias[idx]);
		}

		$scope.lastCriteria=JSON.parse(JSON.stringify(c));
		
		genericSearchFactory.getSearch(peopleSchemaUri, c,convertSortBy( $scope.sortBy),0,pageSize).success(function(data) {
			$scope.data = data;
		}).error(function(err) {
			notificationFactory.error(err);
		});
	};	
	
	$scope.setSortBy=function (header){
		if ($scope.sortBy && $scope.sortBy.header===header){
			if ( 'asc'===$scope.sortBy.direction) {
				$scope.sortBy={header: header , direction : 'desc' };
			}
			else {
				$scope.sortBy={header: header , direction : 'asc' };
			} 
		}
		else {
			$scope.sortBy={header: header , direction : 'desc' };
		}
		$scope.search();
	};
	
	$scope.searchNext = function() {
		var c = convertCriteria($scope.searchCrit);
		// add forced criteria
		for (var idx = 0; idx < $scope.forcedCriterias.length; idx++) {
			c.push($scope.forcedCriterias[idx]);
		}
		genericSearchFactory.getSearch(peopleSchemaUri, $scope.lastCriteria,convertSortBy( $scope.sortBy),$scope.data.length,pageSize).success(function(data) {
			
			data.map(function (newItems){
				$scope.data.push(newItems);
			});
			
			
		}).error(function(err) {
			notificationFactory.error(err);
		});
	};
	
	$scope.sendMail=function(){
		var userIds=null;
		var criteria=null;
		if ($scope.selectAll){
			criteria=$scope.lastCriteria;
		}
		else {
			userIds=[];
			for(var index in $scope.data){
				if( $scope.data[index].selected){
					
					userIds.push($scope.data[index].id);
				}
			}
		}
		massmailingFactory.sendMail($scope.selectedTemplate,criteria,userIds);
	};
	
} ]);
