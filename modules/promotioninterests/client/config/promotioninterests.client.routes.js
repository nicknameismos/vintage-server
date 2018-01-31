(function () {
  'use strict';

  angular
    .module('promotioninterests')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('promotioninterests', {
        abstract: true,
        url: '/promotioninterests',
        template: '<ui-view/>'
      })
      .state('promotioninterests.list', {
        url: '',
        templateUrl: 'modules/promotioninterests/client/views/list-promotioninterests.client.view.html',
        controller: 'PromotioninterestsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Promotioninterests List'
        }
      })
      .state('promotioninterests.create', {
        url: '/create',
        templateUrl: 'modules/promotioninterests/client/views/form-promotioninterest.client.view.html',
        controller: 'PromotioninterestsController',
        controllerAs: 'vm',
        resolve: {
          promotioninterestResolve: newPromotioninterest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Promotioninterests Create'
        }
      })
      .state('promotioninterests.edit', {
        url: '/:promotioninterestId/edit',
        templateUrl: 'modules/promotioninterests/client/views/form-promotioninterest.client.view.html',
        controller: 'PromotioninterestsController',
        controllerAs: 'vm',
        resolve: {
          promotioninterestResolve: getPromotioninterest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Promotioninterest {{ promotioninterestResolve.name }}'
        }
      })
      .state('promotioninterests.view', {
        url: '/:promotioninterestId',
        templateUrl: 'modules/promotioninterests/client/views/view-promotioninterest.client.view.html',
        controller: 'PromotioninterestsController',
        controllerAs: 'vm',
        resolve: {
          promotioninterestResolve: getPromotioninterest
        },
        data: {
          pageTitle: 'Promotioninterest {{ promotioninterestResolve.name }}'
        }
      });
  }

  getPromotioninterest.$inject = ['$stateParams', 'PromotioninterestsService'];

  function getPromotioninterest($stateParams, PromotioninterestsService) {
    return PromotioninterestsService.get({
      promotioninterestId: $stateParams.promotioninterestId
    }).$promise;
  }

  newPromotioninterest.$inject = ['PromotioninterestsService'];

  function newPromotioninterest(PromotioninterestsService) {
    return new PromotioninterestsService();
  }
}());
