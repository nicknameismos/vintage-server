(function () {
  'use strict';

  // Greetings controller
  angular
    .module('greetings')
    .controller('GreetingsController', GreetingsController);

  GreetingsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'greetingResolve'];

  function GreetingsController ($scope, $state, $window, Authentication, greeting) {
    var vm = this;

    vm.authentication = Authentication;
    vm.greeting = greeting;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Greeting
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.greeting.$remove($state.go('greetings.list'));
      }
    }

    // Save Greeting
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.greetingForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.greeting._id) {
        vm.greeting.$update(successCallback, errorCallback);
      } else {
        vm.greeting.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('greetings.view', {
          greetingId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
