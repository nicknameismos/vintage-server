(function () {
  'use strict';

  describe('Bids Route Tests', function () {
    // Initialize global variables
    var $scope,
      BidsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _BidsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      BidsService = _BidsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('bids');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/bids');
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
          BidsController,
          mockBid;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('bids.view');
          $templateCache.put('modules/bids/client/views/view-bid.client.view.html', '');

          // create mock Bid
          mockBid = new BidsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Bid Name'
          });

          // Initialize Controller
          BidsController = $controller('BidsController as vm', {
            $scope: $scope,
            bidResolve: mockBid
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:bidId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.bidResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            bidId: 1
          })).toEqual('/bids/1');
        }));

        it('should attach an Bid to the controller scope', function () {
          expect($scope.vm.bid._id).toBe(mockBid._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/bids/client/views/view-bid.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          BidsController,
          mockBid;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('bids.create');
          $templateCache.put('modules/bids/client/views/form-bid.client.view.html', '');

          // create mock Bid
          mockBid = new BidsService();

          // Initialize Controller
          BidsController = $controller('BidsController as vm', {
            $scope: $scope,
            bidResolve: mockBid
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.bidResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/bids/create');
        }));

        it('should attach an Bid to the controller scope', function () {
          expect($scope.vm.bid._id).toBe(mockBid._id);
          expect($scope.vm.bid._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/bids/client/views/form-bid.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          BidsController,
          mockBid;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('bids.edit');
          $templateCache.put('modules/bids/client/views/form-bid.client.view.html', '');

          // create mock Bid
          mockBid = new BidsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Bid Name'
          });

          // Initialize Controller
          BidsController = $controller('BidsController as vm', {
            $scope: $scope,
            bidResolve: mockBid
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:bidId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.bidResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            bidId: 1
          })).toEqual('/bids/1/edit');
        }));

        it('should attach an Bid to the controller scope', function () {
          expect($scope.vm.bid._id).toBe(mockBid._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/bids/client/views/form-bid.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
