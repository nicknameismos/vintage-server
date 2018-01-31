(function () {
  'use strict';

  describe('Contactchoices Controller Tests', function () {
    // Initialize global variables
    var ContactchoicesController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      ContactchoicesService,
      mockContactchoice;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _ContactchoicesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ContactchoicesService = _ContactchoicesService_;

      // create mock Contactchoice
      mockContactchoice = new ContactchoicesService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Contactchoice Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Contactchoices controller.
      ContactchoicesController = $controller('ContactchoicesController as vm', {
        $scope: $scope,
        contactchoiceResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleContactchoicePostData;

      beforeEach(function () {
        // Create a sample Contactchoice object
        sampleContactchoicePostData = new ContactchoicesService({
          name: 'Contactchoice Name'
        });

        $scope.vm.contactchoice = sampleContactchoicePostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (ContactchoicesService) {
        // Set POST response
        $httpBackend.expectPOST('api/contactchoices', sampleContactchoicePostData).respond(mockContactchoice);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Contactchoice was created
        expect($state.go).toHaveBeenCalledWith('contactchoices.view', {
          contactchoiceId: mockContactchoice._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/contactchoices', sampleContactchoicePostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Contactchoice in $scope
        $scope.vm.contactchoice = mockContactchoice;
      });

      it('should update a valid Contactchoice', inject(function (ContactchoicesService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/contactchoices\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('contactchoices.view', {
          contactchoiceId: mockContactchoice._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (ContactchoicesService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/contactchoices\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Contactchoices
        $scope.vm.contactchoice = mockContactchoice;
      });

      it('should delete the Contactchoice and redirect to Contactchoices', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/contactchoices\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('contactchoices.list');
      });

      it('should should not delete the Contactchoice and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
