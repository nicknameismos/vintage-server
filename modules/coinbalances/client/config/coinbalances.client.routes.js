(function () {
  'use strict';

  angular
    .module('coinbalances')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('coinbalances', {
        abstract: true,
        url: '/coinbalances',
        template: '<ui-view/>'
      })
      .state('coinbalances.list', {
        url: '',
        templateUrl: 'modules/coinbalances/client/views/list-coinbalances.client.view.html',
        controller: 'CoinbalancesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Coinbalances List'
        }
      })
      .state('coinbalances.create', {
        url: '/create',
        templateUrl: 'modules/coinbalances/client/views/form-coinbalance.client.view.html',
        controller: 'CoinbalancesController',
        controllerAs: 'vm',
        resolve: {
          coinbalanceResolve: newCoinbalance
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Coinbalances Create'
        }
      })
      .state('coinbalances.edit', {
        url: '/:coinbalanceId/edit',
        templateUrl: 'modules/coinbalances/client/views/form-coinbalance.client.view.html',
        controller: 'CoinbalancesController',
        controllerAs: 'vm',
        resolve: {
          coinbalanceResolve: getCoinbalance
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Coinbalance {{ coinbalanceResolve.name }}'
        }
      })
      .state('coinbalances.view', {
        url: '/:coinbalanceId',
        templateUrl: 'modules/coinbalances/client/views/view-coinbalance.client.view.html',
        controller: 'CoinbalancesController',
        controllerAs: 'vm',
        resolve: {
          coinbalanceResolve: getCoinbalance
        },
        data: {
          pageTitle: 'Coinbalance {{ coinbalanceResolve.name }}'
        }
      });
  }

  getCoinbalance.$inject = ['$stateParams', 'CoinbalancesService'];

  function getCoinbalance($stateParams, CoinbalancesService) {
    return CoinbalancesService.get({
      coinbalanceId: $stateParams.coinbalanceId
    }).$promise;
  }

  newCoinbalance.$inject = ['CoinbalancesService'];

  function newCoinbalance(CoinbalancesService) {
    return new CoinbalancesService();
  }
}());
