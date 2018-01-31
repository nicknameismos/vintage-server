// Promotioninterests service used to communicate Promotioninterests REST endpoints
(function () {
  'use strict';

  angular
    .module('promotioninterests')
    .factory('PromotioninterestsService', PromotioninterestsService);

  PromotioninterestsService.$inject = ['$resource'];

  function PromotioninterestsService($resource) {
    return $resource('api/promotioninterests/:promotioninterestId', {
      promotioninterestId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
