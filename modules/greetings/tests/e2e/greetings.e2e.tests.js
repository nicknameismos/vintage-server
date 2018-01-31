'use strict';

describe('Greetings E2E Tests:', function () {
  describe('Test Greetings page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/greetings');
      expect(element.all(by.repeater('greeting in greetings')).count()).toEqual(0);
    });
  });
});
