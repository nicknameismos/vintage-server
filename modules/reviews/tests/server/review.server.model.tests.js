'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Review = mongoose.model('Review');

/**
 * Globals
 */
var user,
  review;

/**
 * Unit tests
 */
describe('Review Model Unit Tests:', function () {
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
      review = new Review({
        title: 'Review title',
        description: 'Review description',
        image: 'Review image',
        likes: [user],
        active: true,
        iscoin: false,
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return review.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without title', function (done) {
      review.title = '';

      return review.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without image', function (done) {
      review.image = '';

      return review.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Review.remove().exec(function () {
      User.remove().exec(function () {
        done();
      });
    });
  });
});
