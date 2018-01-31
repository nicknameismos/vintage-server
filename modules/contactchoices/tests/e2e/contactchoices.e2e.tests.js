'use strict';

describe('Contactchoices E2E Tests:', function () {
  describe('Test Contactchoices page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/contactchoices');
      expect(element.all(by.repeater('contactchoice in contactchoices')).count()).toEqual(0);
    });
  });
});
