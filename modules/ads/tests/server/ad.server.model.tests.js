'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Ad = mongoose.model('Ad');

/**
 * Globals
 */
var user,
  ad;

/**
 * Unit tests
 */
describe('Ad Model Unit Tests:', function() {
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
      ad = new Ad({
        image: './assets/imgs/ads/ads1.png',
        isvideo: true,
        videoid: '###',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return ad.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    // it('should be able to show an error when try to save without image', function(done) {
    //   ad.image = '';

    //   return ad.save(function(err) {
    //     should.exist(err);
    //     done();
    //   });
    // });
  });

  afterEach(function(done) {
    Ad.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
