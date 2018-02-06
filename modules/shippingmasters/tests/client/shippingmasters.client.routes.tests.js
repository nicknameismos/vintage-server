(function () {
  'use strict';

  describe('Shippingmasters Route Tests', function () {
    // Initialize global variables
    var $scope,
      ShippingmastersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ShippingmastersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ShippingmastersService = _ShippingmastersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('shippingmasters');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/shippingmasters');
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
          ShippingmastersController,
          mockShippingmaster;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('shippingmasters.view');
          $templateCache.put('modules/shippingmasters/client/views/view-shippingmaster.client.view.html', '');

          // create mock Shippingmaster
          mockShippingmaster = new ShippingmastersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Shippingmaster Name'
          });

          // Initialize Controller
          ShippingmastersController = $controller('ShippingmastersController as vm', {
            $scope: $scope,
            shippingmasterResolve: mockShippingmaster
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:shippingmasterId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.shippingmasterResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            shippingmasterId: 1
          })).toEqual('/shippingmasters/1');
        }));

        it('should attach an Shippingmaster to the controller scope', function () {
          expect($scope.vm.shippingmaster._id).toBe(mockShippingmaster._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/shippingmasters/client/views/view-shippingmaster.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ShippingmastersController,
          mockShippingmaster;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('shippingmasters.create');
          $templateCache.put('modules/shippingmasters/client/views/form-shippingmaster.client.view.html', '');

          // create mock Shippingmaster
          mockShippingmaster = new ShippingmastersService();

          // Initialize Controller
          ShippingmastersController = $controller('ShippingmastersController as vm', {
            $scope: $scope,
            shippingmasterResolve: mockShippingmaster
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.shippingmasterResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/shippingmasters/create');
        }));

        it('should attach an Shippingmaster to the controller scope', function () {
          expect($scope.vm.shippingmaster._id).toBe(mockShippingmaster._id);
          expect($scope.vm.shippingmaster._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/shippingmasters/client/views/form-shippingmaster.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ShippingmastersController,
          mockShippingmaster;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('shippingmasters.edit');
          $templateCache.put('modules/shippingmasters/client/views/form-shippingmaster.client.view.html', '');

          // create mock Shippingmaster
          mockShippingmaster = new ShippingmastersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Shippingmaster Name'
          });

          // Initialize Controller
          ShippingmastersController = $controller('ShippingmastersController as vm', {
            $scope: $scope,
            shippingmasterResolve: mockShippingmaster
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:shippingmasterId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.shippingmasterResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            shippingmasterId: 1
          })).toEqual('/shippingmasters/1/edit');
        }));

        it('should attach an Shippingmaster to the controller scope', function () {
          expect($scope.vm.shippingmaster._id).toBe(mockShippingmaster._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/shippingmasters/client/views/form-shippingmaster.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
