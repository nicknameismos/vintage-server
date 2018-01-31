(function () {
  'use strict';

  angular
    .module('campaigns')
    .controller('CampaignsListController', CampaignsListController);

  CampaignsListController.$inject = ['CampaignsService'];

  function CampaignsListController(CampaignsService) {
    var vm = this;

    vm.campaigns = CampaignsService.query();
  }
}());
