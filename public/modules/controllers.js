angular.module('Chat', ['socket-io'])
    .controller('mainController', function($scope, socket) {

        if ($scope.username) {

        }

        // $scope.data = 'empty'
        // socket.on('message', function(message) {
        //     $scope.data = message;
        // }).bindTo($scope);
    });