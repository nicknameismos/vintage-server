(function () {
  'use strict';

  describe('Shopinterests Route Tests', function () {
    // Initialize global variables
    var $scope,
      ShopinterestsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ShopinterestsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ShopinterestsService = _ShopinterestsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('shopinterests');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/shopinterests');
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
          ShopinterestsController,
          mockShopinterest;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('shopinterests.view');
          $templateCache.put('modules/shopinterests/client/views/view-shopinterest.client.view.html', '');

          // create mock Shopinterest
          mockShopinterest = new ShopinterestsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Shopinterest Name'
          });

          // Initialize Controller
          ShopinterestsController = $controller('ShopinterestsController as vm', {
            $scope: $scope,
            shopinterestResolve: mockShopinterest
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:shopinterestId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.shopinterestResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            shopinterestId: 1
          })).toEqual('/shopinterests/1');
        }));

        it('should attach an Shopinterest to the controller scope', function () {
          expect($scope.vm.shopinterest._id).toBe(mockShopinterest._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/shopinterests/client/views/view-shopinterest.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ShopinterestsController,
          mockShopinterest;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('shopinterests.create');
          $templateCache.put('modules/shopinterests/client/views/form-shopinterest.client.view.html', '');

          // create mock Shopinterest
          mockShopinterest = new ShopinterestsService();

          // Initialize Controller
          ShopinterestsController = $controller('ShopinterestsController as vm', {
            $scope: $scope,
            shopinterestResolve: mockShopinterest
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.shopinterestResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/shopinterests/create');
        }));

        it('should attach an Shopinterest to the controller scope', function () {
          expect($scope.vm.shopinterest._id).toBe(mockShopinterest._id);
          expect($scope.vm.shopinterest._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/shopinterests/client/views/form-shopinterest.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ShopinterestsController,
          mockShopinterest;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('shopinterests.edit');
          $templateCache.put('modules/shopinterests/client/views/form-shopinterest.client.view.html', '');

          // create mock Shopinterest
          mockShopinterest = new ShopinterestsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Shopinterest Name'
          });

          // Initialize Controller
          ShopinterestsController = $controller('ShopinterestsController as vm', {
            $scope: $scope,
            shopinterestResolve: mockShopinterest
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:shopinterestId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.shopinterestResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            shopinterestId: 1
          })).toEqual('/shopinterests/1/edit');
        }));

        it('should attach an Shopinterest to the controller scope', function () {
          expect($scope.vm.shopinterest._id).toBe(mockShopinterest._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/shopinterests/client/views/form-shopinterest.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
