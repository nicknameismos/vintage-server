// Coinbalances service used to communicate Coinbalances REST endpoints
(function () {
  'use strict';

  angular
    .module('coinbalances')
    .factory('CoinbalancesService', CoinbalancesService);

  CoinbalancesService.$inject = ['$resource'];

  function CoinbalancesService($resource) {
    return $resource('api/coinbalances/:coinbalanceId', {
      coinbalanceId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
