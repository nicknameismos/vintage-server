(function () {
  'use strict';

  angular
    .module('contactbitebites')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('contactbitebites', {
        abstract: true,
        url: '/contactbitebites',
        template: '<ui-view/>'
      })
      .state('contactbitebites.list', {
        url: '',
        templateUrl: 'modules/contactbitebites/client/views/list-contactbitebites.client.view.html',
        controller: 'ContactbitebitesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Contactbitebites List'
        }
      })
      .state('contactbitebites.create', {
        url: '/create',
        templateUrl: 'modules/contactbitebites/client/views/form-contactbitebite.client.view.html',
        controller: 'ContactbitebitesController',
        controllerAs: 'vm',
        resolve: {
          contactbitebiteResolve: newContactbitebite
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Contactbitebites Create'
        }
      })
      .state('contactbitebites.edit', {
        url: '/:contactbitebiteId/edit',
        templateUrl: 'modules/contactbitebites/client/views/form-contactbitebite.client.view.html',
        controller: 'ContactbitebitesController',
        controllerAs: 'vm',
        resolve: {
          contactbitebiteResolve: getContactbitebite
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Contactbitebite {{ contactbitebiteResolve.name }}'
        }
      })
      .state('contactbitebites.view', {
        url: '/:contactbitebiteId',
        templateUrl: 'modules/contactbitebites/client/views/view-contactbitebite.client.view.html',
        controller: 'ContactbitebitesController',
        controllerAs: 'vm',
        resolve: {
          contactbitebiteResolve: getContactbitebite
        },
        data: {
          pageTitle: 'Contactbitebite {{ contactbitebiteResolve.name }}'
        }
      });
  }

  getContactbitebite.$inject = ['$stateParams', 'ContactbitebitesService'];

  function getContactbitebite($stateParams, ContactbitebitesService) {
    return ContactbitebitesService.get({
      contactbitebiteId: $stateParams.contactbitebiteId
    }).$promise;
  }

  newContactbitebite.$inject = ['ContactbitebitesService'];

  function newContactbitebite(ContactbitebitesService) {
    return new ContactbitebitesService();
  }
}());
