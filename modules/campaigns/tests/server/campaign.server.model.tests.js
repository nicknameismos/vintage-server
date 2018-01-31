'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Campaignmaster = mongoose.model('Campaignmaster'),
  Campaign = mongoose.model('Campaign');

/**
 * Globals
 */
var user,
  campaignmaster,
  campaign;

/**
 * Unit tests
 */
describe('Campaign Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    campaignmaster = new Campaignmaster({
      name: 'Campaign master'
    });

    user.save(function () {
      campaignmaster.save(function () {
        campaign = new Campaign({
          name: 'Campaign name',
          detail: 'Campaign detail',
          coin_give: 10,
          effectivedatestart: Date.now(),
          effectivedateend: Date.now(),
          type: campaignmaster,
          status: false,
          image: 'http://www.safeabortionwomensright.org/wp-content/uploads/2016/02/join-speech-bubble-300x236.png',
          remark: 'Campaign remark',
          user: user
        });

        done();
      });
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return campaign.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function (done) {
      campaign.name = '';

      return campaign.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without coingive', function (done) {
      campaign.coin_give = null;

      return campaign.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without effectivedatestart', function (done) {
      campaign.effectivedatestart = '';

      return campaign.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without effectivedateend', function (done) {
      campaign.effectivedateend = '';

      return campaign.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without type', function (done) {
      campaign.type = [];

      return campaign.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without status', function (done) {
      campaign.status = null;

      return campaign.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without image', function (done) {
      campaign.image = '';

      return campaign.save(function (err) {
        should.exist(err);
        done();
      });
    });

  });

  afterEach(function (done) {
    Campaign.remove().exec(function () {
      Campaignmaster.remove().exec(function () {
        User.remove().exec(function () {
          done();
        });
      });
    });
  });
});
