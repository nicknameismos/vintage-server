(function () {
  'use strict';

  // Campaignmasters controller
  angular
    .module('campaignmasters')
    .controller('CampaignmastersController', CampaignmastersController);

  CampaignmastersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'campaignmasterResolve'];

  function CampaignmastersController ($scope, $state, $window, Authentication, campaignmaster) {
    var vm = this;

    vm.authentication = Authentication;
    vm.campaignmaster = campaignmaster;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Campaignmaster
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.campaignmaster.$remove($state.go('campaignmasters.list'));
      }
    }

    // Save Campaignmaster
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.campaignmasterForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.campaignmaster._id) {
        vm.campaignmaster.$update(successCallback, errorCallback);
      } else {
        vm.campaignmaster.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('campaignmasters.view', {
          campaignmasterId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
