(function () {
  'use strict';

  angular
    .module('shippingmasters')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('shippingmasters', {
        abstract: true,
        url: '/shippingmasters',
        template: '<ui-view/>'
      })
      .state('shippingmasters.list', {
        url: '',
        templateUrl: 'modules/shippingmasters/client/views/list-shippingmasters.client.view.html',
        controller: 'ShippingmastersListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Shippingmasters List'
        }
      })
      .state('shippingmasters.create', {
        url: '/create',
        templateUrl: 'modules/shippingmasters/client/views/form-shippingmaster.client.view.html',
        controller: 'ShippingmastersController',
        controllerAs: 'vm',
        resolve: {
          shippingmasterResolve: newShippingmaster
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Shippingmasters Create'
        }
      })
      .state('shippingmasters.edit', {
        url: '/:shippingmasterId/edit',
        templateUrl: 'modules/shippingmasters/client/views/form-shippingmaster.client.view.html',
        controller: 'ShippingmastersController',
        controllerAs: 'vm',
        resolve: {
          shippingmasterResolve: getShippingmaster
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Shippingmaster {{ shippingmasterResolve.name }}'
        }
      })
      .state('shippingmasters.view', {
        url: '/:shippingmasterId',
        templateUrl: 'modules/shippingmasters/client/views/view-shippingmaster.client.view.html',
        controller: 'ShippingmastersController',
        controllerAs: 'vm',
        resolve: {
          shippingmasterResolve: getShippingmaster
        },
        data: {
          pageTitle: 'Shippingmaster {{ shippingmasterResolve.name }}'
        }
      });
  }

  getShippingmaster.$inject = ['$stateParams', 'ShippingmastersService'];

  function getShippingmaster($stateParams, ShippingmastersService) {
    return ShippingmastersService.get({
      shippingmasterId: $stateParams.shippingmasterId
    }).$promise;
  }

  newShippingmaster.$inject = ['ShippingmastersService'];

  function newShippingmaster(ShippingmastersService) {
    return new ShippingmastersService();
  }
}());
