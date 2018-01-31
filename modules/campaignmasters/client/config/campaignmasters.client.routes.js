(function () {
  'use strict';

  angular
    .module('campaignmasters')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('campaignmasters', {
        abstract: true,
        url: '/campaignmasters',
        template: '<ui-view/>'
      })
      .state('campaignmasters.list', {
        url: '',
        templateUrl: 'modules/campaignmasters/client/views/list-campaignmasters.client.view.html',
        controller: 'CampaignmastersListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Campaignmasters List'
        }
      })
      .state('campaignmasters.create', {
        url: '/create',
        templateUrl: 'modules/campaignmasters/client/views/form-campaignmaster.client.view.html',
        controller: 'CampaignmastersController',
        controllerAs: 'vm',
        resolve: {
          campaignmasterResolve: newCampaignmaster
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Campaignmasters Create'
        }
      })
      .state('campaignmasters.edit', {
        url: '/:campaignmasterId/edit',
        templateUrl: 'modules/campaignmasters/client/views/form-campaignmaster.client.view.html',
        controller: 'CampaignmastersController',
        controllerAs: 'vm',
        resolve: {
          campaignmasterResolve: getCampaignmaster
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Campaignmaster {{ campaignmasterResolve.name }}'
        }
      })
      .state('campaignmasters.view', {
        url: '/:campaignmasterId',
        templateUrl: 'modules/campaignmasters/client/views/view-campaignmaster.client.view.html',
        controller: 'CampaignmastersController',
        controllerAs: 'vm',
        resolve: {
          campaignmasterResolve: getCampaignmaster
        },
        data: {
          pageTitle: 'Campaignmaster {{ campaignmasterResolve.name }}'
        }
      });
  }

  getCampaignmaster.$inject = ['$stateParams', 'CampaignmastersService'];

  function getCampaignmaster($stateParams, CampaignmastersService) {
    return CampaignmastersService.get({
      campaignmasterId: $stateParams.campaignmasterId
    }).$promise;
  }

  newCampaignmaster.$inject = ['CampaignmastersService'];

  function newCampaignmaster(CampaignmastersService) {
    return new CampaignmastersService();
  }
}());
