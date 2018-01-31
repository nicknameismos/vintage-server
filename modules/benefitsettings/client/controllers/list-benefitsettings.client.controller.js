(function () {
  'use strict';

  angular
    .module('benefitsettings')
    .controller('BenefitsettingsListController', BenefitsettingsListController);

  BenefitsettingsListController.$inject = ['BenefitsettingsService'];

  function BenefitsettingsListController(BenefitsettingsService) {
    var vm = this;

    vm.benefitsettings = BenefitsettingsService.query();
  }
}());
