(function () {
  'use strict';

  angular
    .module('shippingmasters')
    .controller('ShippingmastersListController', ShippingmastersListController);

  ShippingmastersListController.$inject = ['ShippingmastersService'];

  function ShippingmastersListController(ShippingmastersService) {
    var vm = this;

    vm.shippingmasters = ShippingmastersService.query();
  }
}());
