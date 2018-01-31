'use strict';

describe('Bids E2E Tests:', function () {
  describe('Test Bids page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/bids');
      expect(element.all(by.repeater('bid in bids')).count()).toEqual(0);
    });
  });
});
