'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Coinbalance = mongoose.model('Coinbalance');

/**
 * Globals
 */
var user,
  coinbalance;

/**
 * Unit tests
 */
describe('Coinbalance Model Unit Tests:', function() {
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
      coinbalance = new Coinbalance({
        name: 'newreg',
        balancetype: 'in',
        volume: 5,
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return coinbalance.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      coinbalance.name = '';

      return coinbalance.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Coinbalance.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
