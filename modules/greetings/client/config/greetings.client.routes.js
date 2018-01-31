(function () {
  'use strict';

  angular
    .module('greetings')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('greetings', {
        abstract: true,
        url: '/greetings',
        template: '<ui-view/>'
      })
      .state('greetings.list', {
        url: '',
        templateUrl: 'modules/greetings/client/views/list-greetings.client.view.html',
        controller: 'GreetingsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Greetings List'
        }
      })
      .state('greetings.create', {
        url: '/create',
        templateUrl: 'modules/greetings/client/views/form-greeting.client.view.html',
        controller: 'GreetingsController',
        controllerAs: 'vm',
        resolve: {
          greetingResolve: newGreeting
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Greetings Create'
        }
      })
      .state('greetings.edit', {
        url: '/:greetingId/edit',
        templateUrl: 'modules/greetings/client/views/form-greeting.client.view.html',
        controller: 'GreetingsController',
        controllerAs: 'vm',
        resolve: {
          greetingResolve: getGreeting
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Greeting {{ greetingResolve.name }}'
        }
      })
      .state('greetings.view', {
        url: '/:greetingId',
        templateUrl: 'modules/greetings/client/views/view-greeting.client.view.html',
        controller: 'GreetingsController',
        controllerAs: 'vm',
        resolve: {
          greetingResolve: getGreeting
        },
        data: {
          pageTitle: 'Greeting {{ greetingResolve.name }}'
        }
      });
  }

  getGreeting.$inject = ['$stateParams', 'GreetingsService'];

  function getGreeting($stateParams, GreetingsService) {
    return GreetingsService.get({
      greetingId: $stateParams.greetingId
    }).$promise;
  }

  newGreeting.$inject = ['GreetingsService'];

  function newGreeting(GreetingsService) {
    return new GreetingsService();
  }
}());
