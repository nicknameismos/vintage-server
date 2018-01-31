(function () {
  'use strict';

  angular
    .module('categoryshops')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('categoryshops', {
        abstract: true,
        url: '/categoryshops',
        template: '<ui-view/>'
      })
      .state('categoryshops.list', {
        url: '',
        templateUrl: 'modules/categoryshops/client/views/list-categoryshops.client.view.html',
        controller: 'CategoryshopsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Categoryshops List'
        }
      })
      .state('categoryshops.create', {
        url: '/create',
        templateUrl: 'modules/categoryshops/client/views/form-categoryshop.client.view.html',
        controller: 'CategoryshopsController',
        controllerAs: 'vm',
        resolve: {
          categoryshopResolve: newCategoryshop
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Categoryshops Create'
        }
      })
      .state('categoryshops.edit', {
        url: '/:categoryshopId/edit',
        templateUrl: 'modules/categoryshops/client/views/form-categoryshop.client.view.html',
        controller: 'CategoryshopsController',
        controllerAs: 'vm',
        resolve: {
          categoryshopResolve: getCategoryshop
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Categoryshop {{ categoryshopResolve.name }}'
        }
      })
      .state('categoryshops.view', {
        url: '/:categoryshopId',
        templateUrl: 'modules/categoryshops/client/views/view-categoryshop.client.view.html',
        controller: 'CategoryshopsController',
        controllerAs: 'vm',
        resolve: {
          categoryshopResolve: getCategoryshop
        },
        data: {
          pageTitle: 'Categoryshop {{ categoryshopResolve.name }}'
        }
      });
  }

  getCategoryshop.$inject = ['$stateParams', 'CategoryshopsService'];

  function getCategoryshop($stateParams, CategoryshopsService) {
    return CategoryshopsService.get({
      categoryshopId: $stateParams.categoryshopId
    }).$promise;
  }

  newCategoryshop.$inject = ['CategoryshopsService'];

  function newCategoryshop(CategoryshopsService) {
    return new CategoryshopsService();
  }
}());
