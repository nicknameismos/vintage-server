(function () {
  'use strict';

  describe('Benefitsettings Controller Tests', function () {
    // Initialize global variables
    var BenefitsettingsController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      BenefitsettingsService,
      mockBenefitsetting;

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
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _BenefitsettingsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      BenefitsettingsService = _BenefitsettingsService_;

      // create mock Benefitsetting
      mockBenefitsetting = new BenefitsettingsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Benefitsetting Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Benefitsettings controller.
      BenefitsettingsController = $controller('BenefitsettingsController as vm', {
        $scope: $scope,
        benefitsettingResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleBenefitsettingPostData;

      beforeEach(function () {
        // Create a sample Benefitsetting object
        sampleBenefitsettingPostData = new BenefitsettingsService({
          name: 'Benefitsetting Name'
        });

        $scope.vm.benefitsetting = sampleBenefitsettingPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (BenefitsettingsService) {
        // Set POST response
        $httpBackend.expectPOST('api/benefitsettings', sampleBenefitsettingPostData).respond(mockBenefitsetting);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Benefitsetting was created
        expect($state.go).toHaveBeenCalledWith('benefitsettings.view', {
          benefitsettingId: mockBenefitsetting._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/benefitsettings', sampleBenefitsettingPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Benefitsetting in $scope
        $scope.vm.benefitsetting = mockBenefitsetting;
      });

      it('should update a valid Benefitsetting', inject(function (BenefitsettingsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/benefitsettings\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('benefitsettings.view', {
          benefitsettingId: mockBenefitsetting._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (BenefitsettingsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/benefitsettings\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Benefitsettings
        $scope.vm.benefitsetting = mockBenefitsetting;
      });

      it('should delete the Benefitsetting and redirect to Benefitsettings', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/benefitsettings\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('benefitsettings.list');
      });

      it('should should not delete the Benefitsetting and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
