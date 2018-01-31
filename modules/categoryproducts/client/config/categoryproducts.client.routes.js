(function () {
  'use strict';

  angular
    .module('categoryproducts')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('categoryproducts', {
        abstract: true,
        url: '/categoryproducts',
        template: '<ui-view/>'
      })
      .state('categoryproducts.list', {
        url: '',
        templateUrl: 'modules/categoryproducts/client/views/list-categoryproducts.client.view.html',
        controller: 'CategoryproductsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Categoryproducts List'
        }
      })
      .state('categoryproducts.create', {
        url: '/create',
        templateUrl: 'modules/categoryproducts/client/views/form-categoryproduct.client.view.html',
        controller: 'CategoryproductsController',
        controllerAs: 'vm',
        resolve: {
          categoryproductResolve: newCategoryproduct
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Categoryproducts Create'
        }
      })
      .state('categoryproducts.edit', {
        url: '/:categoryproductId/edit',
        templateUrl: 'modules/categoryproducts/client/views/form-categoryproduct.client.view.html',
        controller: 'CategoryproductsController',
        controllerAs: 'vm',
        resolve: {
          categoryproductResolve: getCategoryproduct
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Categoryproduct {{ categoryproductResolve.name }}'
        }
      })
      .state('categoryproducts.view', {
        url: '/:categoryproductId',
        templateUrl: 'modules/categoryproducts/client/views/view-categoryproduct.client.view.html',
        controller: 'CategoryproductsController',
        controllerAs: 'vm',
        resolve: {
          categoryproductResolve: getCategoryproduct
        },
        data: {
          pageTitle: 'Categoryproduct {{ categoryproductResolve.name }}'
        }
      });
  }

  getCategoryproduct.$inject = ['$stateParams', 'CategoryproductsService'];

  function getCategoryproduct($stateParams, CategoryproductsService) {
    return CategoryproductsService.get({
      categoryproductId: $stateParams.categoryproductId
    }).$promise;
  }

  newCategoryproduct.$inject = ['CategoryproductsService'];

  function newCategoryproduct(CategoryproductsService) {
    return new CategoryproductsService();
  }
}());
