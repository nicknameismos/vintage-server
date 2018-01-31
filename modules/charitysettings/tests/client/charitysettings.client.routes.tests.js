(function () {
  'use strict';

  describe('Charitysettings Route Tests', function () {
    // Initialize global variables
    var $scope,
      CharitysettingsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CharitysettingsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CharitysettingsService = _CharitysettingsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('charitysettings');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/charitysettings');
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
          CharitysettingsController,
          mockCharitysetting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('charitysettings.view');
          $templateCache.put('modules/charitysettings/client/views/view-charitysetting.client.view.html', '');

          // create mock Charitysetting
          mockCharitysetting = new CharitysettingsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Charitysetting Name'
          });

          // Initialize Controller
          CharitysettingsController = $controller('CharitysettingsController as vm', {
            $scope: $scope,
            charitysettingResolve: mockCharitysetting
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:charitysettingId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.charitysettingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            charitysettingId: 1
          })).toEqual('/charitysettings/1');
        }));

        it('should attach an Charitysetting to the controller scope', function () {
          expect($scope.vm.charitysetting._id).toBe(mockCharitysetting._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/charitysettings/client/views/view-charitysetting.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CharitysettingsController,
          mockCharitysetting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('charitysettings.create');
          $templateCache.put('modules/charitysettings/client/views/form-charitysetting.client.view.html', '');

          // create mock Charitysetting
          mockCharitysetting = new CharitysettingsService();

          // Initialize Controller
          CharitysettingsController = $controller('CharitysettingsController as vm', {
            $scope: $scope,
            charitysettingResolve: mockCharitysetting
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.charitysettingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/charitysettings/create');
        }));

        it('should attach an Charitysetting to the controller scope', function () {
          expect($scope.vm.charitysetting._id).toBe(mockCharitysetting._id);
          expect($scope.vm.charitysetting._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/charitysettings/client/views/form-charitysetting.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CharitysettingsController,
          mockCharitysetting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('charitysettings.edit');
          $templateCache.put('modules/charitysettings/client/views/form-charitysetting.client.view.html', '');

          // create mock Charitysetting
          mockCharitysetting = new CharitysettingsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Charitysetting Name'
          });

          // Initialize Controller
          CharitysettingsController = $controller('CharitysettingsController as vm', {
            $scope: $scope,
            charitysettingResolve: mockCharitysetting
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:charitysettingId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.charitysettingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            charitysettingId: 1
          })).toEqual('/charitysettings/1/edit');
        }));

        it('should attach an Charitysetting to the controller scope', function () {
          expect($scope.vm.charitysetting._id).toBe(mockCharitysetting._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/charitysettings/client/views/form-charitysetting.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
