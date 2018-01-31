// Userinterests service used to communicate Userinterests REST endpoints
(function () {
  'use strict';

  angular
    .module('userinterests')
    .factory('UserinterestsService', UserinterestsService);

  UserinterestsService.$inject = ['$resource'];

  function UserinterestsService($resource) {
    return $resource('api/userinterests/:userinterestId', {
      userinterestId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
