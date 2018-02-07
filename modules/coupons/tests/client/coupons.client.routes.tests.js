(function () {
  'use strict';

  describe('Coupons Route Tests', function () {
    // Initialize global variables
    var $scope,
      CouponsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CouponsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CouponsService = _CouponsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('coupons');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/coupons');
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
          CouponsController,
          mockCoupon;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('coupons.view');
          $templateCache.put('modules/coupons/client/views/view-coupon.client.view.html', '');

          // create mock Coupon
          mockCoupon = new CouponsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Coupon Name'
          });

          // Initialize Controller
          CouponsController = $controller('CouponsController as vm', {
            $scope: $scope,
            couponResolve: mockCoupon
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:couponId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.couponResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            couponId: 1
          })).toEqual('/coupons/1');
        }));

        it('should attach an Coupon to the controller scope', function () {
          expect($scope.vm.coupon._id).toBe(mockCoupon._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/coupons/client/views/view-coupon.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CouponsController,
          mockCoupon;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('coupons.create');
          $templateCache.put('modules/coupons/client/views/form-coupon.client.view.html', '');

          // create mock Coupon
          mockCoupon = new CouponsService();

          // Initialize Controller
          CouponsController = $controller('CouponsController as vm', {
            $scope: $scope,
            couponResolve: mockCoupon
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.couponResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/coupons/create');
        }));

        it('should attach an Coupon to the controller scope', function () {
          expect($scope.vm.coupon._id).toBe(mockCoupon._id);
          expect($scope.vm.coupon._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/coupons/client/views/form-coupon.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CouponsController,
          mockCoupon;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('coupons.edit');
          $templateCache.put('modules/coupons/client/views/form-coupon.client.view.html', '');

          // create mock Coupon
          mockCoupon = new CouponsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Coupon Name'
          });

          // Initialize Controller
          CouponsController = $controller('CouponsController as vm', {
            $scope: $scope,
            couponResolve: mockCoupon
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:couponId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.couponResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            couponId: 1
          })).toEqual('/coupons/1/edit');
        }));

        it('should attach an Coupon to the controller scope', function () {
          expect($scope.vm.coupon._id).toBe(mockCoupon._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/coupons/client/views/form-coupon.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
