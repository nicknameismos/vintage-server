// Benefitsettings service used to communicate Benefitsettings REST endpoints
(function () {
  'use strict';

  angular
    .module('benefitsettings')
    .factory('BenefitsettingsService', BenefitsettingsService);

  BenefitsettingsService.$inject = ['$resource'];

  function BenefitsettingsService($resource) {
    return $resource('api/benefitsettings/:benefitsettingId', {
      benefitsettingId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
