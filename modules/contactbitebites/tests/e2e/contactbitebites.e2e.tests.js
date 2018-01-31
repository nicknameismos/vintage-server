'use strict';

describe('Contactbitebites E2E Tests:', function () {
  describe('Test Contactbitebites page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/contactbitebites');
      expect(element.all(by.repeater('contactbitebite in contactbitebites')).count()).toEqual(0);
    });
  });
});
