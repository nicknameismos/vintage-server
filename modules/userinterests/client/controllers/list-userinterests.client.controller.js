(function () {
  'use strict';

  angular
    .module('userinterests')
    .controller('UserinterestsListController', UserinterestsListController);

  UserinterestsListController.$inject = ['UserinterestsService'];

  function UserinterestsListController(UserinterestsService) {
    var vm = this;

    vm.userinterests = UserinterestsService.query();
  }
}());
