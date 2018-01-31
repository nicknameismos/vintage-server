(function () {
  'use strict';

  // Categoryshops controller
  angular
    .module('categoryshops')
    .controller('CategoryshopsController', CategoryshopsController);

  CategoryshopsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'categoryshopResolve'];

  function CategoryshopsController ($scope, $state, $window, Authentication, categoryshop) {
    var vm = this;

    vm.authentication = Authentication;
    vm.categoryshop = categoryshop;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Categoryshop
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.categoryshop.$remove($state.go('categoryshops.list'));
      }
    }

    // Save Categoryshop
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.categoryshopForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.categoryshop._id) {
        vm.categoryshop.$update(successCallback, errorCallback);
      } else {
        vm.categoryshop.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('categoryshops.view', {
          categoryshopId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
