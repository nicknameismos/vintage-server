'use strict';

describe('Categoryproducts E2E Tests:', function () {
  describe('Test Categoryproducts page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/categoryproducts');
      expect(element.all(by.repeater('categoryproduct in categoryproducts')).count()).toEqual(0);
    });
  });
});
