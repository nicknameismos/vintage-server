(function () {
  'use strict';

  // Bids controller
  angular
    .module('bids')
    .controller('BidsController', BidsController);

  BidsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'bidResolve'];

  function BidsController ($scope, $state, $window, Authentication, bid) {
    var vm = this;

    vm.authentication = Authentication;
    vm.bid = bid;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Bid
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.bid.$remove($state.go('bids.list'));
      }
    }

    // Save Bid
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.bidForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.bid._id) {
        vm.bid.$update(successCallback, errorCallback);
      } else {
        vm.bid.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('bids.view', {
          bidId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
