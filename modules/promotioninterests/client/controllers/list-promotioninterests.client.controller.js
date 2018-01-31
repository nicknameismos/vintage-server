(function () {
  'use strict';

  angular
    .module('promotioninterests')
    .controller('PromotioninterestsListController', PromotioninterestsListController);

  PromotioninterestsListController.$inject = ['PromotioninterestsService'];

  function PromotioninterestsListController(PromotioninterestsService) {
    var vm = this;

    vm.promotioninterests = PromotioninterestsService.query();
  }
}());
