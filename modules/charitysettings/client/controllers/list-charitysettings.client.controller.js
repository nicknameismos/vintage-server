(function () {
  'use strict';

  angular
    .module('charitysettings')
    .controller('CharitysettingsListController', CharitysettingsListController);

  CharitysettingsListController.$inject = ['CharitysettingsService'];

  function CharitysettingsListController(CharitysettingsService) {
    var vm = this;

    vm.charitysettings = CharitysettingsService.query();
  }
}());
