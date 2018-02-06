'use strict';

describe('Shippingmasters E2E Tests:', function () {
  describe('Test Shippingmasters page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/shippingmasters');
      expect(element.all(by.repeater('shippingmaster in shippingmasters')).count()).toEqual(0);
    });
  });
});
