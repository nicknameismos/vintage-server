'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Coupon = mongoose.model('Coupon');

/**
 * Globals
 */
var user,
  coupon;

/**
 * Unit tests
 */
describe('Coupon Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function () {
      coupon = new Coupon({
        code: 'AAAA',
        price: 20,
        type: 'single',
        message: 'message',
        owner: [],
        startdate: new Date(),
        enddate: new Date(),
        useruse: [user],
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return coupon.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without code', function (done) {
      coupon.code = '';

      return coupon.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without price', function (done) {
      coupon.price = null;

      return coupon.save(function (err) {
        should.exist(err);
        done();
      });
    });
    
    it('should be able to show an error when try to save without message', function (done) {
      coupon.message = null;

      return coupon.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without type', function (done) {
      coupon.type = '';

      return coupon.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without wrong type', function (done) {
      coupon.type = 'xxx';

      return coupon.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Coupon.remove().exec(function () {
      User.remove().exec(function () {
        done();
      });
    });
  });
});
