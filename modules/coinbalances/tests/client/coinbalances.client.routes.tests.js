(function () {
  'use strict';

  describe('Coinbalances Route Tests', function () {
    // Initialize global variables
    var $scope,
      CoinbalancesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CoinbalancesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CoinbalancesService = _CoinbalancesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('coinbalances');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/coinbalances');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          CoinbalancesController,
          mockCoinbalance;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('coinbalances.view');
          $templateCache.put('modules/coinbalances/client/views/view-coinbalance.client.view.html', '');

          // create mock Coinbalance
          mockCoinbalance = new CoinbalancesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Coinbalance Name'
          });

          // Initialize Controller
          CoinbalancesController = $controller('CoinbalancesController as vm', {
            $scope: $scope,
            coinbalanceResolve: mockCoinbalance
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:coinbalanceId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.coinbalanceResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            coinbalanceId: 1
          })).toEqual('/coinbalances/1');
        }));

        it('should attach an Coinbalance to the controller scope', function () {
          expect($scope.vm.coinbalance._id).toBe(mockCoinbalance._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/coinbalances/client/views/view-coinbalance.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CoinbalancesController,
          mockCoinbalance;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('coinbalances.create');
          $templateCache.put('modules/coinbalances/client/views/form-coinbalance.client.view.html', '');

          // create mock Coinbalance
          mockCoinbalance = new CoinbalancesService();

          // Initialize Controller
          CoinbalancesController = $controller('CoinbalancesController as vm', {
            $scope: $scope,
            coinbalanceResolve: mockCoinbalance
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.coinbalanceResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/coinbalances/create');
        }));

        it('should attach an Coinbalance to the controller scope', function () {
          expect($scope.vm.coinbalance._id).toBe(mockCoinbalance._id);
          expect($scope.vm.coinbalance._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/coinbalances/client/views/form-coinbalance.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CoinbalancesController,
          mockCoinbalance;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('coinbalances.edit');
          $templateCache.put('modules/coinbalances/client/views/form-coinbalance.client.view.html', '');

          // create mock Coinbalance
          mockCoinbalance = new CoinbalancesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Coinbalance Name'
          });

          // Initialize Controller
          CoinbalancesController = $controller('CoinbalancesController as vm', {
            $scope: $scope,
            coinbalanceResolve: mockCoinbalance
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:coinbalanceId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.coinbalanceResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            coinbalanceId: 1
          })).toEqual('/coinbalances/1/edit');
        }));

        it('should attach an Coinbalance to the controller scope', function () {
          expect($scope.vm.coinbalance._id).toBe(mockCoinbalance._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/coinbalances/client/views/form-coinbalance.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
