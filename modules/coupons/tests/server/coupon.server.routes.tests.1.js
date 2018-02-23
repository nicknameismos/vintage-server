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
  credentials2,
  credentials3,
  user,
  user2,
  user3,
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

    credentials2 = {
      username: 'username2',
      password: 'M3@n.2jsI$Aw3$0m3'
    };

    credentials3 = {
      username: 'username3',
      password: 'M3@n.3jsI$Aw3$0m3'
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

    user2 = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test2@test.com',
      username: credentials2.username,
      password: credentials2.password,
      provider: 'local'
    });

    user3 = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test3@test.com',
      username: credentials3.username,
      password: credentials3.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Coupon
    user.save(function () {
      user2.save(function () {
        user3.save(function () {
          coupon = {
            code: 'AAAA',
            price: 20,
            type: 'single',
            message: 'message',
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

  it('get Coupon by code invalid code', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'single',
      message: 'message',
      owner: [],
      startdate: startdate,
      enddate: enddate,
      useruse: [user],
      user: user
    });

    // Save the Coupon
    couponObj.save(function () {
      var code = {
        code: 'AAA'
      };
      agent.post('/api/auth/signin')
        .send(credentials2)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          agent.post('/api/getcouponbycode')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.status).should.equal(false);
              (discount.message).should.equal('Coupon is invalid!');
              (discount.code).should.equal('');
              // (discount.discount).should.equal('');.to.equal
              // (discount.discount).to.equal(null);
              should.equal(discount.discount, null);
              done();
            });

        });
    });
  });

  it('get Coupon by code expired', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'single',
      message: 'message',
      owner: [],
      startdate: startdate,
      enddate: enddate,
      useruse: [user],
      user: user
    });

    // Save the Coupon
    couponObj.save(function () {
      var code = {
        code: 'AAAA'
      };
      agent.post('/api/auth/signin')
        .send(credentials2)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          agent.post('/api/getcouponbycode')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.status).should.equal(false);
              (discount.message).should.equal('Coupon is expired!');
              (discount.code).should.equal('');
              should.equal(discount.discount, null);
              done();
            });

        });
    });
  });

  it('get Coupon by code but code used type single owner used', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'single',
      message: 'message',
      owner: [user2],
      startdate: startdate,
      enddate: enddate,
      useruse: [user2],
      user: user
    });

    // Save the Coupon
    couponObj.save(function () {
      var code = {
        code: 'AAAA'
      };
      agent.post('/api/auth/signin')
        .send(credentials2)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          agent.post('/api/getcouponbycode')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.status).should.equal(false);
              (discount.message).should.equal('Coupon is already!');
              (discount.code).should.equal('');
              should.equal(discount.discount, null);
              done();
            });

        });
    });
  });

  it('get Coupon by code but code used type single not owner used', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'single',
      message: 'message',
      owner: [user2],
      startdate: startdate,
      enddate: enddate,
      useruse: [user2],
      user: user
    });

    // Save the Coupon
    couponObj.save(function () {
      var code = {
        code: 'AAAA'
      };
      agent.post('/api/auth/signin')
        .send(credentials3)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          agent.post('/api/getcouponbycode')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.status).should.equal(false);
              (discount.message).should.equal('Coupon is invalid!');
              (discount.code).should.equal('');
              should.equal(discount.discount, null);
              done();
            });

        });
    });
  });

  it('get Coupon by code but code used type multi', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'multi',
      message: 'message',
      owner: [],
      startdate: startdate,
      enddate: enddate,
      useruse: [user2],
      user: user
    });

    // Save the Coupon
    couponObj.save(function () {
      var code = {
        code: 'AAAA'
      };
      agent.post('/api/auth/signin')
        .send(credentials2)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          agent.post('/api/getcouponbycode')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.status).should.equal(false);
              (discount.message).should.equal('Coupon is already!');
              (discount.code).should.equal('');
              should.equal(discount.discount, null);
              done();
            });

        });
    });
  });

  it('get Coupon by code type single success', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'single',
      message: 'message',
      owner: [user2],
      startdate: startdate,
      enddate: enddate,
      useruse: [],
      user: user
    });

    // Save the Coupon
    couponObj.save(function () {
      var code = {
        code: 'AAAA'
      };
      agent.post('/api/auth/signin')
        .send(credentials2)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          agent.post('/api/getcouponbycode')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.status).should.equal(true);
              (discount.message).should.equal('');
              (discount.code).should.equal('AAAA');
              (discount.discount).should.equal(20);
              done();
            });

        });
    });
  });

  it('get Coupon by code type multi success', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'multi',
      message: 'message',
      owner: [],
      startdate: startdate,
      enddate: enddate,
      useruse: [],
      user: user
    });

    // Save the Coupon
    couponObj.save(function () {
      var code = {
        code: 'AAAA'
      };
      agent.post('/api/auth/signin')
        .send(credentials2)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          agent.post('/api/getcouponbycode')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.status).should.equal(true);
              (discount.message).should.equal('');
              (discount.code).should.equal('AAAA');
              (discount.discount).should.equal(20);
              // should.equal(discount.discount, null);
              done();
            });

        });
    });
  });

  it('get Coupon by admin', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'multi',
      message: 'message',
      owner: [],
      startdate: startdate,
      enddate: enddate,
      useruse: [],
      user: user
    });


    var startexpriedate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);
    var endexpiredate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
    var couponExpire = new Coupon({
      code: 'BBBB',
      price: 20,
      type: 'multi',
      message: 'message',
      owner: [],
      startdate: startexpriedate,
      enddate: endexpiredate,
      useruse: [],
      user: user
    });

    // Save the Coupon
    couponExpire.save();
    couponObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          var code = {
            title: '',
            currentpage: 0,
            keyword: ''
          };
          agent.post('/api/getcouponsbyadmin')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.titles.length).should.equal(2);
              (discount.titles[0]).should.equal('กำลังใช้งาน');
              (discount.titles[1]).should.equal('หมดอายุแล้ว');
              (discount.items.length).should.equal(1);
              (discount.paging.length).should.equal(1);
              done();
            });

        });
    });
  });

  it('get Coupon by admin expire', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'multi',
      message: 'message',
      owner: [],
      startdate: startdate,
      enddate: enddate,
      useruse: [],
      user: user
    });


    var startexpriedate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);
    var endexpiredate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
    var couponExpire = new Coupon({
      code: 'BBBB',
      price: 20,
      type: 'multi',
      message: 'message',
      owner: [],
      startdate: startexpriedate,
      enddate: endexpiredate,
      useruse: [],
      user: user
    });

    // Save the Coupon
    couponExpire.save();
    couponObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          var code = {
            title: 'หมดอายุแล้ว',
            currentpage: 0,
            keyword: ''
          };
          agent.post('/api/getcouponsbyadmin')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.titles.length).should.equal(2);
              (discount.titles[0]).should.equal('กำลังใช้งาน');
              (discount.titles[1]).should.equal('หมดอายุแล้ว');
              (discount.items.length).should.equal(1);
              (discount.paging.length).should.equal(1);
              done();
            });

        });
    });
  });

  it('get Coupon by admin with search', function (done) {
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Create new Coupon model instance
    var couponObj = new Coupon({
      code: 'AAAA',
      price: 20,
      type: 'multi',
      message: 'message',
      owner: [],
      startdate: startdate,
      enddate: enddate,
      useruse: [],
      user: user
    });


    var startexpriedate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);
    var endexpiredate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
    var couponExpire = new Coupon({
      code: 'BBBB',
      price: 20,
      type: 'multi',
      message: 'message',
      owner: [],
      startdate: startexpriedate,
      enddate: endexpiredate,
      useruse: [],
      user: user
    });

    // Save the Coupon
    couponExpire.save();
    couponObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          var code = {
            title: 'หมดอายุแล้ว',
            currentpage: 0,
            keyword: 'CCCC'
          };
          agent.post('/api/getcouponsbyadmin')
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .send(code)
            .expect(200)
            .end(function (couponSaveErr, couponSaveRes) {
              // Handle Coupon save error
              if (couponSaveErr) {
                return done(couponSaveErr);
              }

              var discount = couponSaveRes.body;
              (discount.titles.length).should.equal(2);
              (discount.titles[0]).should.equal('กำลังใช้งาน');
              (discount.titles[1]).should.equal('หมดอายุแล้ว');
              (discount.items.length).should.equal(0);
              (discount.paging.length).should.equal(0);
              done();
            });

        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Coupon.remove().exec(done);
    });
  });
});
