var solarSystem = angular.module('solarSystem', ['ngRoute']);

solarSystem.factory('JsonService', ['$http', function ($http) {
    return {
        data: function (uri) {
            return $http({
                method: 'GET',
                url: uri
            }).then(function (response) {
                console.log(response.data);
                return {
                    data: response.data
                };
            }, function (error) {
                console.log('error: ' + error);
            });
        },
    };
}]);

solarSystem.controller('detailsController', ['JsonService', '$scope', function(JsonService, $scope) {
    var me = this;

    this.showDetailContainer = true;

    JsonService.data('/static/data/panelData.json').then(function(d) {
        me.detailData = d.data.panel;
    }, function(error) {
        me.panelData = 'ERROR ' + error;
    });
}]);