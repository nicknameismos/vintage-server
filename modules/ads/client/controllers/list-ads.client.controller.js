(function () {
  'use strict';

  angular
    .module('ads')
    .controller('AdsListController', AdsListController);

  AdsListController.$inject = ['AdsService'];

  function AdsListController(AdsService) {
    var vm = this;

    vm.ads = AdsService.query();
  }
}());
