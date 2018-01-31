'use strict';

describe('Ads E2E Tests:', function () {
  describe('Test Ads page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/ads');
      expect(element.all(by.repeater('ad in ads')).count()).toEqual(0);
    });
  });
});
