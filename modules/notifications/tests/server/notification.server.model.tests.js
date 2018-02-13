'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  pushNotification = mongoose.model('Notification');

/**
 * Globals
 */
var user,
  notification;

/**
 * Unit tests
 */
describe('pushNotification Model Unit Tests:', function() {
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
      notification = new pushNotification({
        title: 'pushNotification Name',
        detail: 'detail',
        userowner: user,
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return notification.save(function(err) {
        should.not.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    pushNotification.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
