(function () {
  'use strict';

  // Ads controller
  angular
    .module('ads')
    .controller('AdsController', AdsController);

  AdsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'adResolve'];

  function AdsController ($scope, $state, $window, Authentication, ad) {
    var vm = this;

    vm.authentication = Authentication;
    vm.ad = ad;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Ad
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.ad.$remove($state.go('ads.list'));
      }
    }

    // Save Ad
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.adForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.ad._id) {
        vm.ad.$update(successCallback, errorCallback);
      } else {
        vm.ad.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('ads.view', {
          adId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
