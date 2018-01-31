(function () {
  'use strict';

  angular
    .module('shopinterests')
    .controller('ShopinterestsListController', ShopinterestsListController);

  ShopinterestsListController.$inject = ['ShopinterestsService'];

  function ShopinterestsListController(ShopinterestsService) {
    var vm = this;

    vm.shopinterests = ShopinterestsService.query();
  }
}());
