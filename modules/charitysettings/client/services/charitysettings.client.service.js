// Charitysettings service used to communicate Charitysettings REST endpoints
(function () {
  'use strict';

  angular
    .module('charitysettings')
    .factory('CharitysettingsService', CharitysettingsService);

  CharitysettingsService.$inject = ['$resource'];

  function CharitysettingsService($resource) {
    return $resource('api/charitysettings/:charitysettingId', {
      charitysettingId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
