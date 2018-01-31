(function () {
  'use strict';

  angular
    .module('ads')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('ads', {
        abstract: true,
        url: '/ads',
        template: '<ui-view/>'
      })
      .state('ads.list', {
        url: '',
        templateUrl: 'modules/ads/client/views/list-ads.client.view.html',
        controller: 'AdsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Ads List'
        }
      })
      .state('ads.create', {
        url: '/create',
        templateUrl: 'modules/ads/client/views/form-ad.client.view.html',
        controller: 'AdsController',
        controllerAs: 'vm',
        resolve: {
          adResolve: newAd
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Ads Create'
        }
      })
      .state('ads.edit', {
        url: '/:adId/edit',
        templateUrl: 'modules/ads/client/views/form-ad.client.view.html',
        controller: 'AdsController',
        controllerAs: 'vm',
        resolve: {
          adResolve: getAd
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Ad {{ adResolve.name }}'
        }
      })
      .state('ads.view', {
        url: '/:adId',
        templateUrl: 'modules/ads/client/views/view-ad.client.view.html',
        controller: 'AdsController',
        controllerAs: 'vm',
        resolve: {
          adResolve: getAd
        },
        data: {
          pageTitle: 'Ad {{ adResolve.name }}'
        }
      });
  }

  getAd.$inject = ['$stateParams', 'AdsService'];

  function getAd($stateParams, AdsService) {
    return AdsService.get({
      adId: $stateParams.adId
    }).$promise;
  }

  newAd.$inject = ['AdsService'];

  function newAd(AdsService) {
    return new AdsService();
  }
}());
