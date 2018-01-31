// Greetings service used to communicate Greetings REST endpoints
(function () {
  'use strict';

  angular
    .module('greetings')
    .factory('GreetingsService', GreetingsService);

  GreetingsService.$inject = ['$resource'];

  function GreetingsService($resource) {
    return $resource('api/greetings/:greetingId', {
      greetingId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
