(function () {
  'use strict';

  describe('Promotioninterests List Controller Tests', function () {
    // Initialize global variables
    var PromotioninterestsListController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      PromotioninterestsService,
      mockPromotioninterest;

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
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _PromotioninterestsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      PromotioninterestsService = _PromotioninterestsService_;

      // create mock article
      mockPromotioninterest = new PromotioninterestsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Promotioninterest Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Promotioninterests List controller.
      PromotioninterestsListController = $controller('PromotioninterestsListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockPromotioninterestList;

      beforeEach(function () {
        mockPromotioninterestList = [mockPromotioninterest, mockPromotioninterest];
      });

      it('should send a GET request and return all Promotioninterests', inject(function (PromotioninterestsService) {
        // Set POST response
        $httpBackend.expectGET('api/promotioninterests').respond(mockPromotioninterestList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.promotioninterests.length).toEqual(2);
        expect($scope.vm.promotioninterests[0]).toEqual(mockPromotioninterest);
        expect($scope.vm.promotioninterests[1]).toEqual(mockPromotioninterest);

      }));
    });
  });
}());
