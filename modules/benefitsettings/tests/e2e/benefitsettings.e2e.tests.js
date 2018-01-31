'use strict';

describe('Benefitsettings E2E Tests:', function () {
  describe('Test Benefitsettings page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/benefitsettings');
      expect(element.all(by.repeater('benefitsetting in benefitsettings')).count()).toEqual(0);
    });
  });
});
