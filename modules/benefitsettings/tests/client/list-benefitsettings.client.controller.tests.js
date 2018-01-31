(function () {
  'use strict';

  describe('Benefitsettings List Controller Tests', function () {
    // Initialize global variables
    var BenefitsettingsListController,
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

      // create mock article
      mockBenefitsetting = new BenefitsettingsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Benefitsetting Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Benefitsettings List controller.
      BenefitsettingsListController = $controller('BenefitsettingsListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockBenefitsettingList;

      beforeEach(function () {
        mockBenefitsettingList = [mockBenefitsetting, mockBenefitsetting];
      });

      it('should send a GET request and return all Benefitsettings', inject(function (BenefitsettingsService) {
        // Set POST response
        $httpBackend.expectGET('api/benefitsettings').respond(mockBenefitsettingList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.benefitsettings.length).toEqual(2);
        expect($scope.vm.benefitsettings[0]).toEqual(mockBenefitsetting);
        expect($scope.vm.benefitsettings[1]).toEqual(mockBenefitsetting);

      }));
    });
  });
}());
