'use strict';

describe('Coupons E2E Tests:', function () {
  describe('Test Coupons page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/coupons');
      expect(element.all(by.repeater('coupon in coupons')).count()).toEqual(0);
    });
  });
});
