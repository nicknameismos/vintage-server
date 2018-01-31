(function () {
  'use strict';

  // Hotprices controller
  angular
    .module('hotprices')
    .controller('HotpricesController', HotpricesController);

  HotpricesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'hotpriceResolve'];

  function HotpricesController ($scope, $state, $window, Authentication, hotprice) {
    var vm = this;

    vm.authentication = Authentication;
    vm.hotprice = hotprice;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Hotprice
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.hotprice.$remove($state.go('hotprices.list'));
      }
    }

    // Save Hotprice
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.hotpriceForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.hotprice._id) {
        vm.hotprice.$update(successCallback, errorCallback);
      } else {
        vm.hotprice.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('hotprices.view', {
          hotpriceId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
