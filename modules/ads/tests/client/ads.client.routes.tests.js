(function () {
  'use strict';

  describe('Ads Route Tests', function () {
    // Initialize global variables
    var $scope,
      AdsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _AdsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      AdsService = _AdsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('ads');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/ads');
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
          AdsController,
          mockAd;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('ads.view');
          $templateCache.put('modules/ads/client/views/view-ad.client.view.html', '');

          // create mock Ad
          mockAd = new AdsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Ad Name'
          });

          // Initialize Controller
          AdsController = $controller('AdsController as vm', {
            $scope: $scope,
            adResolve: mockAd
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:adId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.adResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            adId: 1
          })).toEqual('/ads/1');
        }));

        it('should attach an Ad to the controller scope', function () {
          expect($scope.vm.ad._id).toBe(mockAd._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/ads/client/views/view-ad.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          AdsController,
          mockAd;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('ads.create');
          $templateCache.put('modules/ads/client/views/form-ad.client.view.html', '');

          // create mock Ad
          mockAd = new AdsService();

          // Initialize Controller
          AdsController = $controller('AdsController as vm', {
            $scope: $scope,
            adResolve: mockAd
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.adResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/ads/create');
        }));

        it('should attach an Ad to the controller scope', function () {
          expect($scope.vm.ad._id).toBe(mockAd._id);
          expect($scope.vm.ad._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/ads/client/views/form-ad.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          AdsController,
          mockAd;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('ads.edit');
          $templateCache.put('modules/ads/client/views/form-ad.client.view.html', '');

          // create mock Ad
          mockAd = new AdsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Ad Name'
          });

          // Initialize Controller
          AdsController = $controller('AdsController as vm', {
            $scope: $scope,
            adResolve: mockAd
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:adId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.adResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            adId: 1
          })).toEqual('/ads/1/edit');
        }));

        it('should attach an Ad to the controller scope', function () {
          expect($scope.vm.ad._id).toBe(mockAd._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/ads/client/views/form-ad.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
