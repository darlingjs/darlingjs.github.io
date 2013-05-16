var MobileTricks = angular.module('MobileTricks', []);

function MobileGyroCtrl($scope) {
    'use strict';
    $scope.x = 0.0;
    $scope.y = 0.0;
    $scope.z = 0.0;
    $scope.source = '';

    var measurements = {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        alpha: 0.0,
        beta: 0.0,
        gamma: 0.0
    }, calibration = {
        x: 0,
        y: 0,
        z: 0,
        alpha: 0,
        beta: 0,
        gamma: 0
    };
    /**
     * @private
     */

    function setupListeners() {
        window.addEventListener('MozOrientation', function(e) {
            $scope.x = measurements.x = e.x - calibration.x;
            $scope.y = measurements.y = e.y - calibration.y;
            $scope.z = measurements.z = e.z - calibration.z;
            $scope.source = 'MozOrientation';
        }, true);

        window.addEventListener('devicemotion', function(e) {
            $scope.x = measurements.x = e.accelerationIncludingGravity.x - calibration.x;
            $scope.y = measurements.y = e.accelerationIncludingGravity.y - calibration.y;
            $scope.z = measurements.z = e.accelerationIncludingGravity.z - calibration.z;
            $scope.source = 'devicemotion';
        }, true);

        window.addEventListener('deviceorientation', function(e) {
            $scope.x = measurements.alpha = e.alpha - calibration.alpha;
            $scope.y = measurements.beta = e.beta - calibration.beta;
            $scope.z = measurements.gamma = e.gamma - calibration.gamma;
            $scope.source = 'deviceorientation';
        }, true);
    }
    setupListeners();
}

function MobileTouchesCtrl($scope) {
    $scope.touchstart = [];
    $scope.touchmove = [];
    $scope.touchend = [];

    window.addEventListener('touchstart', function(event) {
        $scope.touchstart = event.touches;
    });

    window.addEventListener('touchstart', function(event) {
        $scope.touchstart = event.touches;
    });

    window.addEventListener('touchmove', function(event) {
        $scope.touchmove = event.touches;
    });

    window.addEventListener('touchend', function(event) {
        $scope.touchend = event.touches;
    });
}