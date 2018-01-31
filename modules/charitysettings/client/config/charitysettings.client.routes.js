(function () {
  'use strict';

  angular
    .module('charitysettings')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('charitysettings', {
        abstract: true,
        url: '/charitysettings',
        template: '<ui-view/>'
      })
      .state('charitysettings.list', {
        url: '',
        templateUrl: 'modules/charitysettings/client/views/list-charitysettings.client.view.html',
        controller: 'CharitysettingsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Charitysettings List'
        }
      })
      .state('charitysettings.create', {
        url: '/create',
        templateUrl: 'modules/charitysettings/client/views/form-charitysetting.client.view.html',
        controller: 'CharitysettingsController',
        controllerAs: 'vm',
        resolve: {
          charitysettingResolve: newCharitysetting
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Charitysettings Create'
        }
      })
      .state('charitysettings.edit', {
        url: '/:charitysettingId/edit',
        templateUrl: 'modules/charitysettings/client/views/form-charitysetting.client.view.html',
        controller: 'CharitysettingsController',
        controllerAs: 'vm',
        resolve: {
          charitysettingResolve: getCharitysetting
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Charitysetting {{ charitysettingResolve.name }}'
        }
      })
      .state('charitysettings.view', {
        url: '/:charitysettingId',
        templateUrl: 'modules/charitysettings/client/views/view-charitysetting.client.view.html',
        controller: 'CharitysettingsController',
        controllerAs: 'vm',
        resolve: {
          charitysettingResolve: getCharitysetting
        },
        data: {
          pageTitle: 'Charitysetting {{ charitysettingResolve.name }}'
        }
      });
  }

  getCharitysetting.$inject = ['$stateParams', 'CharitysettingsService'];

  function getCharitysetting($stateParams, CharitysettingsService) {
    return CharitysettingsService.get({
      charitysettingId: $stateParams.charitysettingId
    }).$promise;
  }

  newCharitysetting.$inject = ['CharitysettingsService'];

  function newCharitysetting(CharitysettingsService) {
    return new CharitysettingsService();
  }
}());
