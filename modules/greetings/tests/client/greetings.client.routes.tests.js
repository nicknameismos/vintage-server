(function () {
  'use strict';

  describe('Greetings Route Tests', function () {
    // Initialize global variables
    var $scope,
      GreetingsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _GreetingsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      GreetingsService = _GreetingsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('greetings');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/greetings');
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
          GreetingsController,
          mockGreeting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('greetings.view');
          $templateCache.put('modules/greetings/client/views/view-greeting.client.view.html', '');

          // create mock Greeting
          mockGreeting = new GreetingsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Greeting Name'
          });

          // Initialize Controller
          GreetingsController = $controller('GreetingsController as vm', {
            $scope: $scope,
            greetingResolve: mockGreeting
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:greetingId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.greetingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            greetingId: 1
          })).toEqual('/greetings/1');
        }));

        it('should attach an Greeting to the controller scope', function () {
          expect($scope.vm.greeting._id).toBe(mockGreeting._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/greetings/client/views/view-greeting.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          GreetingsController,
          mockGreeting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('greetings.create');
          $templateCache.put('modules/greetings/client/views/form-greeting.client.view.html', '');

          // create mock Greeting
          mockGreeting = new GreetingsService();

          // Initialize Controller
          GreetingsController = $controller('GreetingsController as vm', {
            $scope: $scope,
            greetingResolve: mockGreeting
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.greetingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/greetings/create');
        }));

        it('should attach an Greeting to the controller scope', function () {
          expect($scope.vm.greeting._id).toBe(mockGreeting._id);
          expect($scope.vm.greeting._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/greetings/client/views/form-greeting.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          GreetingsController,
          mockGreeting;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('greetings.edit');
          $templateCache.put('modules/greetings/client/views/form-greeting.client.view.html', '');

          // create mock Greeting
          mockGreeting = new GreetingsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Greeting Name'
          });

          // Initialize Controller
          GreetingsController = $controller('GreetingsController as vm', {
            $scope: $scope,
            greetingResolve: mockGreeting
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:greetingId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.greetingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            greetingId: 1
          })).toEqual('/greetings/1/edit');
        }));

        it('should attach an Greeting to the controller scope', function () {
          expect($scope.vm.greeting._id).toBe(mockGreeting._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/greetings/client/views/form-greeting.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
