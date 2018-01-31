'use strict';

describe('Promotioninterests E2E Tests:', function () {
  describe('Test Promotioninterests page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/promotioninterests');
      expect(element.all(by.repeater('promotioninterest in promotioninterests')).count()).toEqual(0);
    });
  });
});
