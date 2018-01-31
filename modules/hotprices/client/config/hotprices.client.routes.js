(function () {
  'use strict';

  angular
    .module('hotprices')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('hotprices', {
        abstract: true,
        url: '/hotprices',
        template: '<ui-view/>'
      })
      .state('hotprices.list', {
        url: '',
        templateUrl: 'modules/hotprices/client/views/list-hotprices.client.view.html',
        controller: 'HotpricesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Hotprices List'
        }
      })
      .state('hotprices.create', {
        url: '/create',
        templateUrl: 'modules/hotprices/client/views/form-hotprice.client.view.html',
        controller: 'HotpricesController',
        controllerAs: 'vm',
        resolve: {
          hotpriceResolve: newHotprice
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Hotprices Create'
        }
      })
      .state('hotprices.edit', {
        url: '/:hotpriceId/edit',
        templateUrl: 'modules/hotprices/client/views/form-hotprice.client.view.html',
        controller: 'HotpricesController',
        controllerAs: 'vm',
        resolve: {
          hotpriceResolve: getHotprice
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Hotprice {{ hotpriceResolve.name }}'
        }
      })
      .state('hotprices.view', {
        url: '/:hotpriceId',
        templateUrl: 'modules/hotprices/client/views/view-hotprice.client.view.html',
        controller: 'HotpricesController',
        controllerAs: 'vm',
        resolve: {
          hotpriceResolve: getHotprice
        },
        data: {
          pageTitle: 'Hotprice {{ hotpriceResolve.name }}'
        }
      });
  }

  getHotprice.$inject = ['$stateParams', 'HotpricesService'];

  function getHotprice($stateParams, HotpricesService) {
    return HotpricesService.get({
      hotpriceId: $stateParams.hotpriceId
    }).$promise;
  }

  newHotprice.$inject = ['HotpricesService'];

  function newHotprice(HotpricesService) {
    return new HotpricesService();
  }
}());
