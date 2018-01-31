(function () {
  'use strict';

  angular
    .module('bids')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('bids', {
        abstract: true,
        url: '/bids',
        template: '<ui-view/>'
      })
      .state('bids.list', {
        url: '',
        templateUrl: 'modules/bids/client/views/list-bids.client.view.html',
        controller: 'BidsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Bids List'
        }
      })
      .state('bids.create', {
        url: '/create',
        templateUrl: 'modules/bids/client/views/form-bid.client.view.html',
        controller: 'BidsController',
        controllerAs: 'vm',
        resolve: {
          bidResolve: newBid
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Bids Create'
        }
      })
      .state('bids.edit', {
        url: '/:bidId/edit',
        templateUrl: 'modules/bids/client/views/form-bid.client.view.html',
        controller: 'BidsController',
        controllerAs: 'vm',
        resolve: {
          bidResolve: getBid
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Bid {{ bidResolve.name }}'
        }
      })
      .state('bids.view', {
        url: '/:bidId',
        templateUrl: 'modules/bids/client/views/view-bid.client.view.html',
        controller: 'BidsController',
        controllerAs: 'vm',
        resolve: {
          bidResolve: getBid
        },
        data: {
          pageTitle: 'Bid {{ bidResolve.name }}'
        }
      });
  }

  getBid.$inject = ['$stateParams', 'BidsService'];

  function getBid($stateParams, BidsService) {
    return BidsService.get({
      bidId: $stateParams.bidId
    }).$promise;
  }

  newBid.$inject = ['BidsService'];

  function newBid(BidsService) {
    return new BidsService();
  }
}());
