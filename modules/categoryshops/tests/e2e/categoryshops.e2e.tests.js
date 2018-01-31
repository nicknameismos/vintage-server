'use strict';

describe('Categoryshops E2E Tests:', function () {
  describe('Test Categoryshops page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/categoryshops');
      expect(element.all(by.repeater('categoryshop in categoryshops')).count()).toEqual(0);
    });
  });
});
