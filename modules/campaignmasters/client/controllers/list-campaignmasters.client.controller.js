(function () {
  'use strict';

  angular
    .module('campaignmasters')
    .controller('CampaignmastersListController', CampaignmastersListController);

  CampaignmastersListController.$inject = ['CampaignmastersService'];

  function CampaignmastersListController(CampaignmastersService) {
    var vm = this;

    vm.campaignmasters = CampaignmastersService.query();
  }
}());
