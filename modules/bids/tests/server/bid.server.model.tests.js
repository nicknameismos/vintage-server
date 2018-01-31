'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Bid = mongoose.model('Bid');

/**
 * Globals
 */
var user,
  bid;

/**
 * Unit tests
 */
describe('Bid Model Unit Tests:', function () {
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
      bid = new Bid({
        name: 'Bid name',
        detail: 'bid detail',
        startprice: 50,
        bidprice: 100,
        starttime: new Date(),
        endtime: new Date(),
        image: 'image',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return bid.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function (done) {
      bid.name = '';

      return bid.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without image', function (done) {
      bid.image = '';

      return bid.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without bidprice', function (done) {
      bid.bidprice = null;

      return bid.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Bid.remove().exec(function () {
      User.remove().exec(function () {
        done();
      });
    });
  });
});
