// Campaignmasters service used to communicate Campaignmasters REST endpoints
(function () {
  'use strict';

  angular
    .module('campaignmasters')
    .factory('CampaignmastersService', CampaignmastersService);

  CampaignmastersService.$inject = ['$resource'];

  function CampaignmastersService($resource) {
    return $resource('api/campaignmasters/:campaignmasterId', {
      campaignmasterId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
