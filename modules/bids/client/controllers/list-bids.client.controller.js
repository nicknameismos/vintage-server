(function () {
  'use strict';

  angular
    .module('bids')
    .controller('BidsListController', BidsListController);

  BidsListController.$inject = ['BidsService'];

  function BidsListController(BidsService) {
    var vm = this;

    vm.bids = BidsService.query();
  }
}());
