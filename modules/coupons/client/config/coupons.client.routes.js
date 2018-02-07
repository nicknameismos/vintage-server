(function () {
  'use strict';

  angular
    .module('coupons')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('coupons', {
        abstract: true,
        url: '/coupons',
        template: '<ui-view/>'
      })
      .state('coupons.list', {
        url: '',
        templateUrl: 'modules/coupons/client/views/list-coupons.client.view.html',
        controller: 'CouponsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Coupons List'
        }
      })
      .state('coupons.create', {
        url: '/create',
        templateUrl: 'modules/coupons/client/views/form-coupon.client.view.html',
        controller: 'CouponsController',
        controllerAs: 'vm',
        resolve: {
          couponResolve: newCoupon
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Coupons Create'
        }
      })
      .state('coupons.edit', {
        url: '/:couponId/edit',
        templateUrl: 'modules/coupons/client/views/form-coupon.client.view.html',
        controller: 'CouponsController',
        controllerAs: 'vm',
        resolve: {
          couponResolve: getCoupon
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Coupon {{ couponResolve.name }}'
        }
      })
      .state('coupons.view', {
        url: '/:couponId',
        templateUrl: 'modules/coupons/client/views/view-coupon.client.view.html',
        controller: 'CouponsController',
        controllerAs: 'vm',
        resolve: {
          couponResolve: getCoupon
        },
        data: {
          pageTitle: 'Coupon {{ couponResolve.name }}'
        }
      });
  }

  getCoupon.$inject = ['$stateParams', 'CouponsService'];

  function getCoupon($stateParams, CouponsService) {
    return CouponsService.get({
      couponId: $stateParams.couponId
    }).$promise;
  }

  newCoupon.$inject = ['CouponsService'];

  function newCoupon(CouponsService) {
    return new CouponsService();
  }
}());
