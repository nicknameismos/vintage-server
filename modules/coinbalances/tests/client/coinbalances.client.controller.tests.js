(function () {
  'use strict';

  describe('Coinbalances Controller Tests', function () {
    // Initialize global variables
    var CoinbalancesController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      CoinbalancesService,
      mockCoinbalance;

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
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _CoinbalancesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      CoinbalancesService = _CoinbalancesService_;

      // create mock Coinbalance
      mockCoinbalance = new CoinbalancesService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Coinbalance Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Coinbalances controller.
      CoinbalancesController = $controller('CoinbalancesController as vm', {
        $scope: $scope,
        coinbalanceResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleCoinbalancePostData;

      beforeEach(function () {
        // Create a sample Coinbalance object
        sampleCoinbalancePostData = new CoinbalancesService({
          name: 'Coinbalance Name'
        });

        $scope.vm.coinbalance = sampleCoinbalancePostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (CoinbalancesService) {
        // Set POST response
        $httpBackend.expectPOST('api/coinbalances', sampleCoinbalancePostData).respond(mockCoinbalance);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Coinbalance was created
        expect($state.go).toHaveBeenCalledWith('coinbalances.view', {
          coinbalanceId: mockCoinbalance._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/coinbalances', sampleCoinbalancePostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Coinbalance in $scope
        $scope.vm.coinbalance = mockCoinbalance;
      });

      it('should update a valid Coinbalance', inject(function (CoinbalancesService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/coinbalances\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('coinbalances.view', {
          coinbalanceId: mockCoinbalance._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (CoinbalancesService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/coinbalances\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Coinbalances
        $scope.vm.coinbalance = mockCoinbalance;
      });

      it('should delete the Coinbalance and redirect to Coinbalances', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/coinbalances\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('coinbalances.list');
      });

      it('should should not delete the Coinbalance and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
