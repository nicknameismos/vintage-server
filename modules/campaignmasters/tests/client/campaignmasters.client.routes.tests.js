(function () {
  'use strict';

  describe('Campaignmasters Route Tests', function () {
    // Initialize global variables
    var $scope,
      CampaignmastersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CampaignmastersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CampaignmastersService = _CampaignmastersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('campaignmasters');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/campaignmasters');
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
          CampaignmastersController,
          mockCampaignmaster;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('campaignmasters.view');
          $templateCache.put('modules/campaignmasters/client/views/view-campaignmaster.client.view.html', '');

          // create mock Campaignmaster
          mockCampaignmaster = new CampaignmastersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Campaignmaster Name'
          });

          // Initialize Controller
          CampaignmastersController = $controller('CampaignmastersController as vm', {
            $scope: $scope,
            campaignmasterResolve: mockCampaignmaster
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:campaignmasterId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.campaignmasterResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            campaignmasterId: 1
          })).toEqual('/campaignmasters/1');
        }));

        it('should attach an Campaignmaster to the controller scope', function () {
          expect($scope.vm.campaignmaster._id).toBe(mockCampaignmaster._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/campaignmasters/client/views/view-campaignmaster.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CampaignmastersController,
          mockCampaignmaster;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('campaignmasters.create');
          $templateCache.put('modules/campaignmasters/client/views/form-campaignmaster.client.view.html', '');

          // create mock Campaignmaster
          mockCampaignmaster = new CampaignmastersService();

          // Initialize Controller
          CampaignmastersController = $controller('CampaignmastersController as vm', {
            $scope: $scope,
            campaignmasterResolve: mockCampaignmaster
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.campaignmasterResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/campaignmasters/create');
        }));

        it('should attach an Campaignmaster to the controller scope', function () {
          expect($scope.vm.campaignmaster._id).toBe(mockCampaignmaster._id);
          expect($scope.vm.campaignmaster._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/campaignmasters/client/views/form-campaignmaster.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CampaignmastersController,
          mockCampaignmaster;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('campaignmasters.edit');
          $templateCache.put('modules/campaignmasters/client/views/form-campaignmaster.client.view.html', '');

          // create mock Campaignmaster
          mockCampaignmaster = new CampaignmastersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Campaignmaster Name'
          });

          // Initialize Controller
          CampaignmastersController = $controller('CampaignmastersController as vm', {
            $scope: $scope,
            campaignmasterResolve: mockCampaignmaster
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:campaignmasterId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.campaignmasterResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            campaignmasterId: 1
          })).toEqual('/campaignmasters/1/edit');
        }));

        it('should attach an Campaignmaster to the controller scope', function () {
          expect($scope.vm.campaignmaster._id).toBe(mockCampaignmaster._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/campaignmasters/client/views/form-campaignmaster.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
