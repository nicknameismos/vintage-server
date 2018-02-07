(function () {
  'use strict';

  angular
    .module('coupons')
    .controller('CouponsListController', CouponsListController);

  CouponsListController.$inject = ['CouponsService'];

  function CouponsListController(CouponsService) {
    var vm = this;

    vm.coupons = CouponsService.query();
  }
}());
