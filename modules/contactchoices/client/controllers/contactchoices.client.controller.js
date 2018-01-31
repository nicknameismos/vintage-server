(function () {
  'use strict';

  // Contactchoices controller
  angular
    .module('contactchoices')
    .controller('ContactchoicesController', ContactchoicesController);

  ContactchoicesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'contactchoiceResolve'];

  function ContactchoicesController ($scope, $state, $window, Authentication, contactchoice) {
    var vm = this;

    vm.authentication = Authentication;
    vm.contactchoice = contactchoice;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Contactchoice
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.contactchoice.$remove($state.go('contactchoices.list'));
      }
    }

    // Save Contactchoice
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.contactchoiceForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.contactchoice._id) {
        vm.contactchoice.$update(successCallback, errorCallback);
      } else {
        vm.contactchoice.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('contactchoices.view', {
          contactchoiceId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
