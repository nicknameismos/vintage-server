(function () {
  'use strict';

  // Contactbitebites controller
  angular
    .module('contactbitebites')
    .controller('ContactbitebitesController', ContactbitebitesController);

  ContactbitebitesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'contactbitebiteResolve'];

  function ContactbitebitesController ($scope, $state, $window, Authentication, contactbitebite) {
    var vm = this;

    vm.authentication = Authentication;
    vm.contactbitebite = contactbitebite;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Contactbitebite
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.contactbitebite.$remove($state.go('contactbitebites.list'));
      }
    }

    // Save Contactbitebite
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.contactbitebiteForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.contactbitebite._id) {
        vm.contactbitebite.$update(successCallback, errorCallback);
      } else {
        vm.contactbitebite.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('contactbitebites.view', {
          contactbitebiteId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
