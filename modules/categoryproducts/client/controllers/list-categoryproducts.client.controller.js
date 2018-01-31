(function () {
  'use strict';

  angular
    .module('categoryproducts')
    .controller('CategoryproductsListController', CategoryproductsListController);

  CategoryproductsListController.$inject = ['CategoryproductsService'];

  function CategoryproductsListController(CategoryproductsService) {
    var vm = this;

    vm.categoryproducts = CategoryproductsService.query();
  }
}());
