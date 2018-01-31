'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Greeting = mongoose.model('Greeting');

/**
 * Globals
 */
var user,
  greeting;

/**
 * Unit tests
 */
describe('Greeting Model Unit Tests:', function() {
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
      greeting = new Greeting({
        images: ['image1.jpg','image2.jpg','image3.jpg','image4.jpg','image5.jpg'],
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return greeting.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without images', function(done) {
      greeting.images = '';

      return greeting.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Greeting.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
