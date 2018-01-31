(function () {
  'use strict';

  angular
    .module('contactchoices')
    .controller('ContactchoicesListController', ContactchoicesListController);

  ContactchoicesListController.$inject = ['ContactchoicesService'];

  function ContactchoicesListController(ContactchoicesService) {
    var vm = this;

    vm.contactchoices = ContactchoicesService.query();
  }
}());
