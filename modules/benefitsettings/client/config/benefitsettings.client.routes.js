(function () {
  'use strict';

  angular
    .module('benefitsettings')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('benefitsettings', {
        abstract: true,
        url: '/benefitsettings',
        template: '<ui-view/>'
      })
      .state('benefitsettings.list', {
        url: '',
        templateUrl: 'modules/benefitsettings/client/views/list-benefitsettings.client.view.html',
        controller: 'BenefitsettingsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Benefitsettings List'
        }
      })
      .state('benefitsettings.create', {
        url: '/create',
        templateUrl: 'modules/benefitsettings/client/views/form-benefitsetting.client.view.html',
        controller: 'BenefitsettingsController',
        controllerAs: 'vm',
        resolve: {
          benefitsettingResolve: newBenefitsetting
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Benefitsettings Create'
        }
      })
      .state('benefitsettings.edit', {
        url: '/:benefitsettingId/edit',
        templateUrl: 'modules/benefitsettings/client/views/form-benefitsetting.client.view.html',
        controller: 'BenefitsettingsController',
        controllerAs: 'vm',
        resolve: {
          benefitsettingResolve: getBenefitsetting
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Benefitsetting {{ benefitsettingResolve.name }}'
        }
      })
      .state('benefitsettings.view', {
        url: '/:benefitsettingId',
        templateUrl: 'modules/benefitsettings/client/views/view-benefitsetting.client.view.html',
        controller: 'BenefitsettingsController',
        controllerAs: 'vm',
        resolve: {
          benefitsettingResolve: getBenefitsetting
        },
        data: {
          pageTitle: 'Benefitsetting {{ benefitsettingResolve.name }}'
        }
      });
  }

  getBenefitsetting.$inject = ['$stateParams', 'BenefitsettingsService'];

  function getBenefitsetting($stateParams, BenefitsettingsService) {
    return BenefitsettingsService.get({
      benefitsettingId: $stateParams.benefitsettingId
    }).$promise;
  }

  newBenefitsetting.$inject = ['BenefitsettingsService'];

  function newBenefitsetting(BenefitsettingsService) {
    return new BenefitsettingsService();
  }
}());
