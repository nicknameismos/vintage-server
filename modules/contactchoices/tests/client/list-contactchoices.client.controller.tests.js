(function () {
  'use strict';

  describe('Contactchoices List Controller Tests', function () {
    // Initialize global variables
    var ContactchoicesListController,
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

      // create mock article
      mockContactchoice = new ContactchoicesService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Contactchoice Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Contactchoices List controller.
      ContactchoicesListController = $controller('ContactchoicesListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockContactchoiceList;

      beforeEach(function () {
        mockContactchoiceList = [mockContactchoice, mockContactchoice];
      });

      it('should send a GET request and return all Contactchoices', inject(function (ContactchoicesService) {
        // Set POST response
        $httpBackend.expectGET('api/contactchoices').respond(mockContactchoiceList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.contactchoices.length).toEqual(2);
        expect($scope.vm.contactchoices[0]).toEqual(mockContactchoice);
        expect($scope.vm.contactchoices[1]).toEqual(mockContactchoice);

      }));
    });
  });
}());
