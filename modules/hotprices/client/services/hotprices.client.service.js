// Hotprices service used to communicate Hotprices REST endpoints
(function () {
  'use strict';

  angular
    .module('hotprices')
    .factory('HotpricesService', HotpricesService);

  HotpricesService.$inject = ['$resource'];

  function HotpricesService($resource) {
    return $resource('api/hotprices/:hotpriceId', {
      hotpriceId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
