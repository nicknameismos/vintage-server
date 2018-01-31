(function () {
  'use strict';

  // Promotioninterests controller
  angular
    .module('promotioninterests')
    .controller('PromotioninterestsController', PromotioninterestsController);

  PromotioninterestsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'promotioninterestResolve'];

  function PromotioninterestsController ($scope, $state, $window, Authentication, promotioninterest) {
    var vm = this;

    vm.authentication = Authentication;
    vm.promotioninterest = promotioninterest;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Promotioninterest
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.promotioninterest.$remove($state.go('promotioninterests.list'));
      }
    }

    // Save Promotioninterest
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.promotioninterestForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.promotioninterest._id) {
        vm.promotioninterest.$update(successCallback, errorCallback);
      } else {
        vm.promotioninterest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('promotioninterests.view', {
          promotioninterestId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
