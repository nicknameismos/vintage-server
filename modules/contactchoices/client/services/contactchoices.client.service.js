// Contactchoices service used to communicate Contactchoices REST endpoints
(function () {
  'use strict';

  angular
    .module('contactchoices')
    .factory('ContactchoicesService', ContactchoicesService);

  ContactchoicesService.$inject = ['$resource'];

  function ContactchoicesService($resource) {
    return $resource('api/contactchoices/:contactchoiceId', {
      contactchoiceId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
