'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Coupon = mongoose.model('Coupon'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  coupon;

/**
 * Coupon routes tests
 */
describe('Coupon CRUD tests with token', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local',
      roles: ['admin']
    });

    // Save a user to the test db and create new Coupon
    user.save(function () {
      coupon = {
        code: 'AAAA',
        price: 20,
        type: 'single',
        owner: [],
        startdate: new Date(),
        enddate: new Date(),
        useruse: [user],
      };
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          signinRes.body.loginToken.should.not.be.empty();
          token = signinRes.body.loginToken;
          done();
        });
    });
  });

  it('should be able to save a Coupon if logged in', function (done) {

    // Save a new Coupon
    agent.post('/api/coupons')
      .set('authorization', 'Bearer ' + token)
      .send(coupon)
      .expect(200)
      .end(function (couponSaveErr, couponSaveRes) {
        // Handle Coupon save error
        if (couponSaveErr) {
          return done(couponSaveErr);
        }

        // Get a list of Coupons
        agent.get('/api/coupons')
          .end(function (couponsGetErr, couponsGetRes) {
            // Handle Coupons save error
            if (couponsGetErr) {
              return done(couponsGetErr);
            }

            // Get Coupons list
            var coupons = couponsGetRes.body;

            // Set assertions
            (coupons[0].user._id).should.equal(user.id);
            (coupons[0].code).should.match('AAAA');

            // Call the assertion callback
            done();
          });
      });
  });

  it('should not be able to save an Coupon if no code is provided', function (done) {
    // Invalidate name field
    coupon.code = '';
    // Save a new Coupon
    agent.post('/api/coupons')
      .set('authorization', 'Bearer ' + token)
      .send(coupon)
      .expect(400)
      .end(function (couponSaveErr, couponSaveRes) {
        // Set message assertion
        (couponSaveRes.body.message).should.match('Please fill Coupon Code');

        // Handle Coupon save error
        done(couponSaveErr);
      });
  });

  it('should not be able to save an Coupon if no price is provided', function (done) {
    // Invalidate name field
    coupon.price = null;

    // Save a new Coupon
    agent.post('/api/coupons')
      .set('authorization', 'Bearer ' + token)
      .send(coupon)
      .expect(400)
      .end(function (couponSaveErr, couponSaveRes) {
        // Set message assertion
        (couponSaveRes.body.message).should.match('Please fill Coupon Price');

        // Handle Coupon save error
        done(couponSaveErr);
      });
  });

  it('should not be able to save an Coupon if no price is provided', function (done) {
    // Invalidate name field
    coupon.price = null;

    // Save a new Coupon
    agent.post('/api/coupons')
      .set('authorization', 'Bearer ' + token)
      .send(coupon)
      .expect(400)
      .end(function (couponSaveErr, couponSaveRes) {
        // Set message assertion
        (couponSaveRes.body.message).should.match('Please fill Coupon Price');

        // Handle Coupon save error
        done(couponSaveErr);
      });
  });

  it('should not be able to save an Coupon if no type is provided', function (done) {
    // Invalidate name field
    coupon.type = '';

    // Save a new Coupon
    agent.post('/api/coupons')
      .set('authorization', 'Bearer ' + token)
      .send(coupon)
      .expect(400)
      .end(function (couponSaveErr, couponSaveRes) {
        // Set message assertion
        (couponSaveRes.body.message).should.match('Please provide at least one type');

        // Handle Coupon save error
        done(couponSaveErr);
      });
  });

  it('should be able to update an Coupon if signed in', function (done) {

    // Save a new Coupon
    agent.post('/api/coupons')
      .set('authorization', 'Bearer ' + token)
      .send(coupon)
      .expect(200)
      .end(function (couponSaveErr, couponSaveRes) {
        // Handle Coupon save error
        if (couponSaveErr) {
          return done(couponSaveErr);
        }

        // Update Coupon name
        coupon.code = 'WHY YOU GOTTA BE SO MEAN?';

        // Update an existing Coupon
        agent.put('/api/coupons/' + couponSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(coupon)
          .expect(200)
          .end(function (couponUpdateErr, couponUpdateRes) {
            // Handle Coupon update error
            if (couponUpdateErr) {
              return done(couponUpdateErr);
            }

            // Set assertions
            (couponUpdateRes.body._id).should.equal(couponSaveRes.body._id);
            (couponUpdateRes.body.code).should.match('WHY YOU GOTTA BE SO MEAN?');

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get a list of Coupons if not signed in', function (done) {
    // Create new Coupon model instance
    var couponObj = new Coupon(coupon);

    // Save the coupon
    couponObj.save(function () {
      // Request Coupons
      request(app).get('/api/coupons')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Coupon if not signed in', function (done) {
    // Create new Coupon model instance
    var couponObj = new Coupon(coupon);

    // Save the Coupon
    couponObj.save(function () {
      request(app).get('/api/coupons/' + couponObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('code', coupon.code);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Coupon with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/coupons/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Coupon is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Coupon which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Coupon
    request(app).get('/api/coupons/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Coupon with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Coupon if signed in', function (done) {
    agent.post('/api/coupons')
      .set('authorization', 'Bearer ' + token)
      .send(coupon)
      .expect(200)
      .end(function (couponSaveErr, couponSaveRes) {
        // Handle Coupon save error
        if (couponSaveErr) {
          return done(couponSaveErr);
        }

        // Delete an existing Coupon
        agent.delete('/api/coupons/' + couponSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(coupon)
          .expect(200)
          .end(function (couponDeleteErr, couponDeleteRes) {
            // Handle coupon error error
            if (couponDeleteErr) {
              return done(couponDeleteErr);
            }

            // Set assertions
            (couponDeleteRes.body._id).should.equal(couponSaveRes.body._id);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should not be able to delete an Coupon if not signed in', function (done) {
    // Set Coupon user
    coupon.user = user;

    // Create new Coupon model instance
    var couponObj = new Coupon(coupon);

    // Save the Coupon
    couponObj.save(function () {
      // Try deleting Coupon
      request(app).delete('/api/coupons/' + couponObj._id)
        .expect(403)
        .end(function (couponDeleteErr, couponDeleteRes) {
          // Set message assertion
          (couponDeleteRes.body.message).should.match('User is not authorized');

          // Handle Coupon error error
          done(couponDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Coupon.remove().exec(done);
    });
  });
});
