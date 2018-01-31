// Contactbitebites service used to communicate Contactbitebites REST endpoints
(function () {
  'use strict';

  angular
    .module('contactbitebites')
    .factory('ContactbitebitesService', ContactbitebitesService);

  ContactbitebitesService.$inject = ['$resource'];

  function ContactbitebitesService($resource) {
    return $resource('api/contactbitebites/:contactbitebiteId', {
      contactbitebiteId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
