(function () {
    'use strict';

    angular
        .module('app')
        .factory('SensorService', Service);
        
    
    function Service($http, $q) {
        var service = {};

        service.getCurrentSensor    = getCurrentSensor;
        service.getAllSensor        = getAllSensor;
        
        return service;

        function getCurrentSensor() {
            return $http.get('/api/sensor/current').then(handleSuccess, handleError);
        }
        
        function getAllSensor() {
            return $http.get('/api/sensor/all').then(handleSuccess, handleError);
        }
        
        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
