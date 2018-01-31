(function () {
  'use strict';

  angular
    .module('hotprices')
    .controller('HotpricesListController', HotpricesListController);

  HotpricesListController.$inject = ['HotpricesService'];

  function HotpricesListController(HotpricesService) {
    var vm = this;

    vm.hotprices = HotpricesService.query();
  }
}());
