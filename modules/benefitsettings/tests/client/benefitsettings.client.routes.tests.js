(function () {
  'use strict';

  describe('Benefitsettings Route Tests', function () {
    // Initialize global variables
    var $scope,
      BenefitsettingsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _BenefitsettingsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      BenefitsettingsService = _BenefitsettingsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('benefitsettings');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/benefitsettings');
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
          BenefitsettingsController,
          mockBenefitsetting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('benefitsettings.view');
          $templateCache.put('modules/benefitsettings/client/views/view-benefitsetting.client.view.html', '');

          // create mock Benefitsetting
          mockBenefitsetting = new BenefitsettingsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Benefitsetting Name'
          });

          // Initialize Controller
          BenefitsettingsController = $controller('BenefitsettingsController as vm', {
            $scope: $scope,
            benefitsettingResolve: mockBenefitsetting
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:benefitsettingId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.benefitsettingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            benefitsettingId: 1
          })).toEqual('/benefitsettings/1');
        }));

        it('should attach an Benefitsetting to the controller scope', function () {
          expect($scope.vm.benefitsetting._id).toBe(mockBenefitsetting._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/benefitsettings/client/views/view-benefitsetting.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          BenefitsettingsController,
          mockBenefitsetting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('benefitsettings.create');
          $templateCache.put('modules/benefitsettings/client/views/form-benefitsetting.client.view.html', '');

          // create mock Benefitsetting
          mockBenefitsetting = new BenefitsettingsService();

          // Initialize Controller
          BenefitsettingsController = $controller('BenefitsettingsController as vm', {
            $scope: $scope,
            benefitsettingResolve: mockBenefitsetting
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.benefitsettingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/benefitsettings/create');
        }));

        it('should attach an Benefitsetting to the controller scope', function () {
          expect($scope.vm.benefitsetting._id).toBe(mockBenefitsetting._id);
          expect($scope.vm.benefitsetting._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/benefitsettings/client/views/form-benefitsetting.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          BenefitsettingsController,
          mockBenefitsetting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('benefitsettings.edit');
          $templateCache.put('modules/benefitsettings/client/views/form-benefitsetting.client.view.html', '');

          // create mock Benefitsetting
          mockBenefitsetting = new BenefitsettingsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Benefitsetting Name'
          });

          // Initialize Controller
          BenefitsettingsController = $controller('BenefitsettingsController as vm', {
            $scope: $scope,
            benefitsettingResolve: mockBenefitsetting
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:benefitsettingId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.benefitsettingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            benefitsettingId: 1
          })).toEqual('/benefitsettings/1/edit');
        }));

        it('should attach an Benefitsetting to the controller scope', function () {
          expect($scope.vm.benefitsetting._id).toBe(mockBenefitsetting._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/benefitsettings/client/views/form-benefitsetting.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
