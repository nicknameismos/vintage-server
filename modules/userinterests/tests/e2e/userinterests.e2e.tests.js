'use strict';

describe('Userinterests E2E Tests:', function () {
  describe('Test Userinterests page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/userinterests');
      expect(element.all(by.repeater('userinterest in userinterests')).count()).toEqual(0);
    });
  });
});
