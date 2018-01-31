(function () {
  'use strict';

  angular
    .module('coinbalances')
    .controller('CoinbalancesListController', CoinbalancesListController);

  CoinbalancesListController.$inject = ['CoinbalancesService'];

  function CoinbalancesListController(CoinbalancesService) {
    var vm = this;

    vm.coinbalances = CoinbalancesService.query();
  }
}());
