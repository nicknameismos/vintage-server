(function () {
  'use strict';

  // Coinbalances controller
  angular
    .module('coinbalances')
    .controller('CoinbalancesController', CoinbalancesController);

  CoinbalancesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'coinbalanceResolve'];

  function CoinbalancesController ($scope, $state, $window, Authentication, coinbalance) {
    var vm = this;

    vm.authentication = Authentication;
    vm.coinbalance = coinbalance;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Coinbalance
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.coinbalance.$remove($state.go('coinbalances.list'));
      }
    }

    // Save Coinbalance
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.coinbalanceForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.coinbalance._id) {
        vm.coinbalance.$update(successCallback, errorCallback);
      } else {
        vm.coinbalance.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('coinbalances.view', {
          coinbalanceId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
