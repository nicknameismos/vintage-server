'use strict';

describe('Campaignmasters E2E Tests:', function () {
  describe('Test Campaignmasters page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/campaignmasters');
      expect(element.all(by.repeater('campaignmaster in campaignmasters')).count()).toEqual(0);
    });
  });
});
