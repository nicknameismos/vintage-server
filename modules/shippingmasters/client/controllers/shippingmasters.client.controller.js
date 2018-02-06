(function () {
  'use strict';

  // Shippingmasters controller
  angular
    .module('shippingmasters')
    .controller('ShippingmastersController', ShippingmastersController);

  ShippingmastersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'shippingmasterResolve'];

  function ShippingmastersController ($scope, $state, $window, Authentication, shippingmaster) {
    var vm = this;

    vm.authentication = Authentication;
    vm.shippingmaster = shippingmaster;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Shippingmaster
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.shippingmaster.$remove($state.go('shippingmasters.list'));
      }
    }

    // Save Shippingmaster
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.shippingmasterForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.shippingmaster._id) {
        vm.shippingmaster.$update(successCallback, errorCallback);
      } else {
        vm.shippingmaster.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('shippingmasters.view', {
          shippingmasterId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
