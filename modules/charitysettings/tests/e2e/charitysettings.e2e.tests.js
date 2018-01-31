'use strict';

describe('Charitysettings E2E Tests:', function () {
  describe('Test Charitysettings page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/charitysettings');
      expect(element.all(by.repeater('charitysetting in charitysettings')).count()).toEqual(0);
    });
  });
});
