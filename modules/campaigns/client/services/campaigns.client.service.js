// Campaigns service used to communicate Campaigns REST endpoints
(function () {
  'use strict';

  angular
    .module('campaigns')
    .factory('CampaignsService', CampaignsService);

  CampaignsService.$inject = ['$resource'];

  function CampaignsService($resource) {
    return $resource('api/campaigns/:campaignId', {
      campaignId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
