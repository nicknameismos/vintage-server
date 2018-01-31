(function () {
  'use strict';

  angular
    .module('userinterests')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('userinterests', {
        abstract: true,
        url: '/userinterests',
        template: '<ui-view/>'
      })
      .state('userinterests.list', {
        url: '',
        templateUrl: 'modules/userinterests/client/views/list-userinterests.client.view.html',
        controller: 'UserinterestsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Userinterests List'
        }
      })
      .state('userinterests.create', {
        url: '/create',
        templateUrl: 'modules/userinterests/client/views/form-userinterest.client.view.html',
        controller: 'UserinterestsController',
        controllerAs: 'vm',
        resolve: {
          userinterestResolve: newUserinterest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Userinterests Create'
        }
      })
      .state('userinterests.edit', {
        url: '/:userinterestId/edit',
        templateUrl: 'modules/userinterests/client/views/form-userinterest.client.view.html',
        controller: 'UserinterestsController',
        controllerAs: 'vm',
        resolve: {
          userinterestResolve: getUserinterest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Userinterest {{ userinterestResolve.name }}'
        }
      })
      .state('userinterests.view', {
        url: '/:userinterestId',
        templateUrl: 'modules/userinterests/client/views/view-userinterest.client.view.html',
        controller: 'UserinterestsController',
        controllerAs: 'vm',
        resolve: {
          userinterestResolve: getUserinterest
        },
        data: {
          pageTitle: 'Userinterest {{ userinterestResolve.name }}'
        }
      });
  }

  getUserinterest.$inject = ['$stateParams', 'UserinterestsService'];

  function getUserinterest($stateParams, UserinterestsService) {
    return UserinterestsService.get({
      userinterestId: $stateParams.userinterestId
    }).$promise;
  }

  newUserinterest.$inject = ['UserinterestsService'];

  function newUserinterest(UserinterestsService) {
    return new UserinterestsService();
  }
}());
