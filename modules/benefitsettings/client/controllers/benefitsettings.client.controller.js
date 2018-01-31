(function () {
  'use strict';

  // Benefitsettings controller
  angular
    .module('benefitsettings')
    .controller('BenefitsettingsController', BenefitsettingsController);

  BenefitsettingsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'benefitsettingResolve'];

  function BenefitsettingsController ($scope, $state, $window, Authentication, benefitsetting) {
    var vm = this;

    vm.authentication = Authentication;
    vm.benefitsetting = benefitsetting;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Benefitsetting
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.benefitsetting.$remove($state.go('benefitsettings.list'));
      }
    }

    // Save Benefitsetting
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.benefitsettingForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.benefitsetting._id) {
        vm.benefitsetting.$update(successCallback, errorCallback);
      } else {
        vm.benefitsetting.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('benefitsettings.view', {
          benefitsettingId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
