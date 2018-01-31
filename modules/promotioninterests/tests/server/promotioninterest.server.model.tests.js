'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Promotioninterest = mongoose.model('Promotioninterest');

/**
 * Globals
 */
var user,
  promotioninterest;

/**
 * Unit tests
 */
describe('Promotioninterest Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      promotioninterest = new Promotioninterest({
        promotioninterest: 'Promotioninterest name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return promotioninterest.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      promotioninterest.promotioninterest = '';

      return promotioninterest.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Promotioninterest.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
