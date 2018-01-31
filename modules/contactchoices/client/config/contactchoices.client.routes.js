(function () {
  'use strict';

  angular
    .module('contactchoices')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('contactchoices', {
        abstract: true,
        url: '/contactchoices',
        template: '<ui-view/>'
      })
      .state('contactchoices.list', {
        url: '',
        templateUrl: 'modules/contactchoices/client/views/list-contactchoices.client.view.html',
        controller: 'ContactchoicesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Contactchoices List'
        }
      })
      .state('contactchoices.create', {
        url: '/create',
        templateUrl: 'modules/contactchoices/client/views/form-contactchoice.client.view.html',
        controller: 'ContactchoicesController',
        controllerAs: 'vm',
        resolve: {
          contactchoiceResolve: newContactchoice
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Contactchoices Create'
        }
      })
      .state('contactchoices.edit', {
        url: '/:contactchoiceId/edit',
        templateUrl: 'modules/contactchoices/client/views/form-contactchoice.client.view.html',
        controller: 'ContactchoicesController',
        controllerAs: 'vm',
        resolve: {
          contactchoiceResolve: getContactchoice
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Contactchoice {{ contactchoiceResolve.name }}'
        }
      })
      .state('contactchoices.view', {
        url: '/:contactchoiceId',
        templateUrl: 'modules/contactchoices/client/views/view-contactchoice.client.view.html',
        controller: 'ContactchoicesController',
        controllerAs: 'vm',
        resolve: {
          contactchoiceResolve: getContactchoice
        },
        data: {
          pageTitle: 'Contactchoice {{ contactchoiceResolve.name }}'
        }
      });
  }

  getContactchoice.$inject = ['$stateParams', 'ContactchoicesService'];

  function getContactchoice($stateParams, ContactchoicesService) {
    return ContactchoicesService.get({
      contactchoiceId: $stateParams.contactchoiceId
    }).$promise;
  }

  newContactchoice.$inject = ['ContactchoicesService'];

  function newContactchoice(ContactchoicesService) {
    return new ContactchoicesService();
  }
}());
