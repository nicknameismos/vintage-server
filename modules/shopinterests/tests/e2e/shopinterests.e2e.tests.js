'use strict';

describe('Shopinterests E2E Tests:', function () {
  describe('Test Shopinterests page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/shopinterests');
      expect(element.all(by.repeater('shopinterest in shopinterests')).count()).toEqual(0);
    });
  });
});
