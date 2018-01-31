'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Categoryshop = mongoose.model('Categoryshop'),
  Shop = mongoose.model('Shop');

/**
 * Globals
 */
var user,
  categoryshop,
  shop;

/**
 * Unit tests
 */
describe('Shop Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    categoryshop = new Categoryshop({
      name: 'อาหารและเครื่องดื่ม'
    });
    user.save(function () {
      categoryshop.save(function () {
        shop = new Shop({
          name: 'Shop name',
          name_eng: 'Shop name english',
          detail: 'Shop Detail',
          tel: '0894447208',
          email: 'test@gmail.com',
          facebook: 'facebook.com',
          line: '@lineid',
          address: {
            address: '77/7',
            addressdetail: 'in font of 7-eleven',
            subdistinct: 'Lumlukka',
            distinct: 'Lumlukka',
            province: 'BKK',
            postcode: '12150',
            lat: '13.9338949',
            lng: '100.6827773'
          },
          times: [{
            description: 'all days',
            timestart: '08.00',
            timeend: '20.00',
            days: ['mon', 'thu', 'sun']
          }],
          coverimage: 'https://img.wongnai.com/p/l/2016/11/29/15ff08373d31409fb2f80ebf4623589a.jpg',
          promoteimage: ['http://ed.files-media.com/ud/images/1/22/63943/IMG_7799_Cover.jpg'],
          isactiveshop: false,
          importform: 'manual',
          categories: categoryshop,
          user: user
        });

        done();
      });

    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return shop.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function (done) {
      shop.name = '';

      return shop.save(function (err) {
        should.exist(err);
        done();
      });
    });


    it('should be able to show an error when try to save duplicate name', function (done) {
      var shop2 = new Shop(shop);

      return shop.save(function (err) {
        should.not.exist(err);
        shop2.save(function (err) {
          should.exist(err);
          done();
        });

      });
    });


  });

  afterEach(function (done) {
    Shop.remove().exec(function () {
      Categoryshop.remove().exec(function () {
        User.remove().exec(function () {
          done();
        });
      });
    });
  });
});
