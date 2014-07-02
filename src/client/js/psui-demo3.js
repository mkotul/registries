angular.module('psui-demo3',['psui-selectbox'])
.controller('psui-selectbox-demo-simple', ['$scope', function($scope) {
	$scope.selectBoxOpts = {
		data: ['Ano', 'Nie']
	}

	$scope.model = {
		selected: 'xxx'
	}
}])
