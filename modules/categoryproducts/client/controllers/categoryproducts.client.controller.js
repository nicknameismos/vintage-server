(function () {
  'use strict';

  // Categoryproducts controller
  angular
    .module('categoryproducts')
    .controller('CategoryproductsController', CategoryproductsController);

  CategoryproductsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'categoryproductResolve'];

  function CategoryproductsController ($scope, $state, $window, Authentication, categoryproduct) {
    var vm = this;

    vm.authentication = Authentication;
    vm.categoryproduct = categoryproduct;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Categoryproduct
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.categoryproduct.$remove($state.go('categoryproducts.list'));
      }
    }

    // Save Categoryproduct
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.categoryproductForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.categoryproduct._id) {
        vm.categoryproduct.$update(successCallback, errorCallback);
      } else {
        vm.categoryproduct.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('categoryproducts.view', {
          categoryproductId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
