(function () {
  'use strict';

  // Shopinterests controller
  angular
    .module('shopinterests')
    .controller('ShopinterestsController', ShopinterestsController);

  ShopinterestsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'shopinterestResolve'];

  function ShopinterestsController ($scope, $state, $window, Authentication, shopinterest) {
    var vm = this;

    vm.authentication = Authentication;
    vm.shopinterest = shopinterest;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Shopinterest
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.shopinterest.$remove($state.go('shopinterests.list'));
      }
    }

    // Save Shopinterest
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.shopinterestForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.shopinterest._id) {
        vm.shopinterest.$update(successCallback, errorCallback);
      } else {
        vm.shopinterest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('shopinterests.view', {
          shopinterestId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
