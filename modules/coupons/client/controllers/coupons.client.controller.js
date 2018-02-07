(function () {
  'use strict';

  // Coupons controller
  angular
    .module('coupons')
    .controller('CouponsController', CouponsController);

  CouponsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'couponResolve'];

  function CouponsController ($scope, $state, $window, Authentication, coupon) {
    var vm = this;

    vm.authentication = Authentication;
    vm.coupon = coupon;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Coupon
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.coupon.$remove($state.go('coupons.list'));
      }
    }

    // Save Coupon
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.couponForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.coupon._id) {
        vm.coupon.$update(successCallback, errorCallback);
      } else {
        vm.coupon.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('coupons.view', {
          couponId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
