(function () {
  'use strict';

  angular
    .module('greetings')
    .controller('GreetingsListController', GreetingsListController);

  GreetingsListController.$inject = ['GreetingsService'];

  function GreetingsListController(GreetingsService) {
    var vm = this;

    vm.greetings = GreetingsService.query();
  }
}());
