(function () {
  'use strict';

  // Charitysettings controller
  angular
    .module('charitysettings')
    .controller('CharitysettingsController', CharitysettingsController);

  CharitysettingsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'charitysettingResolve'];

  function CharitysettingsController ($scope, $state, $window, Authentication, charitysetting) {
    var vm = this;

    vm.authentication = Authentication;
    vm.charitysetting = charitysetting;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Charitysetting
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.charitysetting.$remove($state.go('charitysettings.list'));
      }
    }

    // Save Charitysetting
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.charitysettingForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.charitysetting._id) {
        vm.charitysetting.$update(successCallback, errorCallback);
      } else {
        vm.charitysetting.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('charitysettings.view', {
          charitysettingId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
