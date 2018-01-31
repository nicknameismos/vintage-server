(function () {
  'use strict';

  angular
    .module('campaigns')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('campaigns', {
        abstract: true,
        url: '/campaigns',
        template: '<ui-view/>'
      })
      .state('campaigns.list', {
        url: '',
        templateUrl: 'modules/campaigns/client/views/list-campaigns.client.view.html',
        controller: 'CampaignsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Campaigns List'
        }
      })
      .state('campaigns.create', {
        url: '/create',
        templateUrl: 'modules/campaigns/client/views/form-campaign.client.view.html',
        controller: 'CampaignsController',
        controllerAs: 'vm',
        resolve: {
          campaignResolve: newCampaign
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Campaigns Create'
        }
      })
      .state('campaigns.edit', {
        url: '/:campaignId/edit',
        templateUrl: 'modules/campaigns/client/views/form-campaign.client.view.html',
        controller: 'CampaignsController',
        controllerAs: 'vm',
        resolve: {
          campaignResolve: getCampaign
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Campaign {{ campaignResolve.name }}'
        }
      })
      .state('campaigns.view', {
        url: '/:campaignId',
        templateUrl: 'modules/campaigns/client/views/view-campaign.client.view.html',
        controller: 'CampaignsController',
        controllerAs: 'vm',
        resolve: {
          campaignResolve: getCampaign
        },
        data: {
          pageTitle: 'Campaign {{ campaignResolve.name }}'
        }
      });
  }

  getCampaign.$inject = ['$stateParams', 'CampaignsService'];

  function getCampaign($stateParams, CampaignsService) {
    return CampaignsService.get({
      campaignId: $stateParams.campaignId
    }).$promise;
  }

  newCampaign.$inject = ['CampaignsService'];

  function newCampaign(CampaignsService) {
    return new CampaignsService();
  }
}());
