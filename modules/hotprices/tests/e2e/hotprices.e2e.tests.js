'use strict';

describe('Hotprices E2E Tests:', function () {
  describe('Test Hotprices page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/hotprices');
      expect(element.all(by.repeater('hotprice in hotprices')).count()).toEqual(0);
    });
  });
});
