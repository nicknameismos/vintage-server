(function () {
  'use strict';

  angular
    .module('shopinterests')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('shopinterests', {
        abstract: true,
        url: '/shopinterests',
        template: '<ui-view/>'
      })
      .state('shopinterests.list', {
        url: '',
        templateUrl: 'modules/shopinterests/client/views/list-shopinterests.client.view.html',
        controller: 'ShopinterestsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Shopinterests List'
        }
      })
      .state('shopinterests.create', {
        url: '/create',
        templateUrl: 'modules/shopinterests/client/views/form-shopinterest.client.view.html',
        controller: 'ShopinterestsController',
        controllerAs: 'vm',
        resolve: {
          shopinterestResolve: newShopinterest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Shopinterests Create'
        }
      })
      .state('shopinterests.edit', {
        url: '/:shopinterestId/edit',
        templateUrl: 'modules/shopinterests/client/views/form-shopinterest.client.view.html',
        controller: 'ShopinterestsController',
        controllerAs: 'vm',
        resolve: {
          shopinterestResolve: getShopinterest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Shopinterest {{ shopinterestResolve.name }}'
        }
      })
      .state('shopinterests.view', {
        url: '/:shopinterestId',
        templateUrl: 'modules/shopinterests/client/views/view-shopinterest.client.view.html',
        controller: 'ShopinterestsController',
        controllerAs: 'vm',
        resolve: {
          shopinterestResolve: getShopinterest
        },
        data: {
          pageTitle: 'Shopinterest {{ shopinterestResolve.name }}'
        }
      });
  }

  getShopinterest.$inject = ['$stateParams', 'ShopinterestsService'];

  function getShopinterest($stateParams, ShopinterestsService) {
    return ShopinterestsService.get({
      shopinterestId: $stateParams.shopinterestId
    }).$promise;
  }

  newShopinterest.$inject = ['ShopinterestsService'];

  function newShopinterest(ShopinterestsService) {
    return new ShopinterestsService();
  }
}());
