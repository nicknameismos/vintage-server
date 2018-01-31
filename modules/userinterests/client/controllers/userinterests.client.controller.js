(function () {
  'use strict';

  // Userinterests controller
  angular
    .module('userinterests')
    .controller('UserinterestsController', UserinterestsController);

  UserinterestsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'userinterestResolve'];

  function UserinterestsController ($scope, $state, $window, Authentication, userinterest) {
    var vm = this;

    vm.authentication = Authentication;
    vm.userinterest = userinterest;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Userinterest
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.userinterest.$remove($state.go('userinterests.list'));
      }
    }

    // Save Userinterest
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.userinterestForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.userinterest._id) {
        vm.userinterest.$update(successCallback, errorCallback);
      } else {
        vm.userinterest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('userinterests.view', {
          userinterestId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
