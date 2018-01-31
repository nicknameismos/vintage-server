(function () {
  'use strict';

  angular
    .module('categoryshops')
    .controller('CategoryshopsListController', CategoryshopsListController);

  CategoryshopsListController.$inject = ['CategoryshopsService'];

  function CategoryshopsListController(CategoryshopsService) {
    var vm = this;

    vm.categoryshops = CategoryshopsService.query();
  }
}());
