'use strict';

describe('Coinbalances E2E Tests:', function () {
  describe('Test Coinbalances page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/coinbalances');
      expect(element.all(by.repeater('coinbalance in coinbalances')).count()).toEqual(0);
    });
  });
});
