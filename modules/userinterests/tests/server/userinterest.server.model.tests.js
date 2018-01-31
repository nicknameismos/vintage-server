'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Promotioninterest = mongoose.model('Promotioninterest'),
  Shopinterest = mongoose.model('Shopinterest'),
  Userinterest = mongoose.model('Userinterest');

/**
 * Globals
 */
var user,
  shopinterest,
  promotioninterest,
  userinterest;

/**
 * Unit tests
 */
describe('Userinterest Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    shopinterest = new Shopinterest({
      shopinterest: 'Shopinterest name'
    });

    promotioninterest = new Promotioninterest({
      promotioninterest: 'Promotioninterest name'
    });

    user.save(function () {
      shopinterest.save(function () {
        promotioninterest.save(function () {
          userinterest = new Userinterest({
            shopinterest: [shopinterest],
            promotioninterest: [promotioninterest],
            user: user
          });
          done();
        });
      });
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return userinterest.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

  });

  afterEach(function (done) {
    Userinterest.remove().exec(function () {
      Promotioninterest.remove().exec(function () {
        Shopinterest.remove().exec(function () {
          User.remove().exec(function () {
            done();
          });
        });
      });
    });
  });
});
