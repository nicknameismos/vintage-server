(function () {
  'use strict';

  angular
    .module('contactbitebites')
    .controller('ContactbitebitesListController', ContactbitebitesListController);

  ContactbitebitesListController.$inject = ['ContactbitebitesService'];

  function ContactbitebitesListController(ContactbitebitesService) {
    var vm = this;

    vm.contactbitebites = ContactbitebitesService.query();
  }
}());
