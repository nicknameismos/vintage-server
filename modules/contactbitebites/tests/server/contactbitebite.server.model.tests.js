'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Contactchoice = mongoose.model('Contactchoice'),
  Contactbitebite = mongoose.model('Contactbitebite');

/**
 * Globals
 */
var user,
  contactchoice,
  contactbitebite;

/**
 * Unit tests
 */
describe('Contactbitebite Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    contactchoice = new Contactchoice({
      name: 'แนะนำบริการ'
    });

    user.save(function () {
      contactchoice.save(function () {
        contactbitebite = new Contactbitebite({
          title: contactchoice,
          description: 'สอบถามการสมัคร',
          image: 'http://www.capitaladvance.co.th/image/mypic_customize/button-submit.jpg',
          user: user
        });

        done();
      });

    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return contactbitebite.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function (done) {
      contactbitebite.title = [];

      return contactbitebite.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Contactbitebite.remove().exec(function () {
      Contactchoice.remove().exec(function () {
        User.remove().exec(function () {
          done();
        });
      });
    });
  });
});
