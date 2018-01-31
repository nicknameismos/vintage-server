'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shopinterest = mongoose.model('Shopinterest'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  shopinterest;

/**
 * Shopinterest routes tests
 */
describe('Shopinterest CRUD tests', function () {

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
      provider: 'local'
    });

    // Save a user to the test db and create new Shopinterest
    user.save(function () {
      shopinterest = {
        shopinterest: 'Shopinterest name'
      };

      done();
    });
  });

  it('should be able to save a Shopinterest if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Shopinterest
        agent.post('/api/shopinterests')
          .send(shopinterest)
          .expect(200)
          .end(function (shopinterestSaveErr, shopinterestSaveRes) {
            // Handle Shopinterest save error
            if (shopinterestSaveErr) {
              return done(shopinterestSaveErr);
            }

            // Get a list of Shopinterests
            agent.get('/api/shopinterests')
              .end(function (shopinterestsGetErr, shopinterestsGetRes) {
                // Handle Shopinterests save error
                if (shopinterestsGetErr) {
                  return done(shopinterestsGetErr);
                }

                // Get Shopinterests list
                var shopinterests = shopinterestsGetRes.body.items;

                // Set assertions
                (shopinterests[0].user._id).should.equal(userId);
                (shopinterests[0].shopinterest).should.match('Shopinterest name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Shopinterest if not logged in', function (done) {
    agent.post('/api/shopinterests')
      .send(shopinterest)
      .expect(403)
      .end(function (shopinterestSaveErr, shopinterestSaveRes) {
        // Call the assertion callback
        done(shopinterestSaveErr);
      });
  });

  it('should not be able to save an Shopinterest if no shopinterest is provided', function (done) {
    // Invalidate shopinterest field
    shopinterest.shopinterest = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Shopinterest
        agent.post('/api/shopinterests')
          .send(shopinterest)
          .expect(400)
          .end(function (shopinterestSaveErr, shopinterestSaveRes) {
            // Set message assertion
            (shopinterestSaveRes.body.message).should.match('Please fill Shopinterest name');

            // Handle Shopinterest save error
            done(shopinterestSaveErr);
          });
      });
  });

  it('should be able to update an Shopinterest if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Shopinterest
        agent.post('/api/shopinterests')
          .send(shopinterest)
          .expect(200)
          .end(function (shopinterestSaveErr, shopinterestSaveRes) {
            // Handle Shopinterest save error
            if (shopinterestSaveErr) {
              return done(shopinterestSaveErr);
            }

            // Update Shopinterest shopinterest
            shopinterest.shopinterest = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Shopinterest
            agent.put('/api/shopinterests/' + shopinterestSaveRes.body._id)
              .send(shopinterest)
              .expect(200)
              .end(function (shopinterestUpdateErr, shopinterestUpdateRes) {
                // Handle Shopinterest update error
                if (shopinterestUpdateErr) {
                  return done(shopinterestUpdateErr);
                }

                // Set assertions
                (shopinterestUpdateRes.body._id).should.equal(shopinterestSaveRes.body._id);
                (shopinterestUpdateRes.body.shopinterest).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Shopinterests if not signed in', function (done) {
    // Create new Shopinterest model instance
    var shopinterestObj = new Shopinterest(shopinterest);

    // Save the shopinterest
    shopinterestObj.save(function () {
      // Request Shopinterests
      request(app).get('/api/shopinterests')
        .end(function (req, res) {
          // Set assertion
          res.body.items.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Shopinterest if not signed in', function (done) {
    // Create new Shopinterest model instance
    var shopinterestObj = new Shopinterest(shopinterest);

    // Save the Shopinterest
    shopinterestObj.save(function () {
      request(app).get('/api/shopinterests/' + shopinterestObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('shopinterest', shopinterest.shopinterest);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Shopinterest with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/shopinterests/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Shopinterest is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Shopinterest which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Shopinterest
    request(app).get('/api/shopinterests/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Shopinterest with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Shopinterest if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Shopinterest
        agent.post('/api/shopinterests')
          .send(shopinterest)
          .expect(200)
          .end(function (shopinterestSaveErr, shopinterestSaveRes) {
            // Handle Shopinterest save error
            if (shopinterestSaveErr) {
              return done(shopinterestSaveErr);
            }

            // Delete an existing Shopinterest
            agent.delete('/api/shopinterests/' + shopinterestSaveRes.body._id)
              .send(shopinterest)
              .expect(200)
              .end(function (shopinterestDeleteErr, shopinterestDeleteRes) {
                // Handle shopinterest error error
                if (shopinterestDeleteErr) {
                  return done(shopinterestDeleteErr);
                }

                // Set assertions
                (shopinterestDeleteRes.body._id).should.equal(shopinterestSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Shopinterest if not signed in', function (done) {
    // Set Shopinterest user
    shopinterest.user = user;

    // Create new Shopinterest model instance
    var shopinterestObj = new Shopinterest(shopinterest);

    // Save the Shopinterest
    shopinterestObj.save(function () {
      // Try deleting Shopinterest
      request(app).delete('/api/shopinterests/' + shopinterestObj._id)
        .expect(403)
        .end(function (shopinterestDeleteErr, shopinterestDeleteRes) {
          // Set message assertion
          (shopinterestDeleteRes.body.message).should.match('User is not authorized');

          // Handle Shopinterest error error
          done(shopinterestDeleteErr);
        });

    });
  });

  it('should be able to get a single Shopinterest that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Shopinterest
          agent.post('/api/shopinterests')
            .send(shopinterest)
            .expect(200)
            .end(function (shopinterestSaveErr, shopinterestSaveRes) {
              // Handle Shopinterest save error
              if (shopinterestSaveErr) {
                return done(shopinterestSaveErr);
              }

              // Set assertions on new Shopinterest
              (shopinterestSaveRes.body.shopinterest).should.equal(shopinterest.shopinterest);
              should.exist(shopinterestSaveRes.body.user);
              should.equal(shopinterestSaveRes.body.user._id, orphanId);

              // force the Shopinterest to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Shopinterest
                    agent.get('/api/shopinterests/' + shopinterestSaveRes.body._id)
                      .expect(200)
                      .end(function (shopinterestInfoErr, shopinterestInfoRes) {
                        // Handle Shopinterest error
                        if (shopinterestInfoErr) {
                          return done(shopinterestInfoErr);
                        }

                        // Set assertions
                        (shopinterestInfoRes.body._id).should.equal(shopinterestSaveRes.body._id);
                        (shopinterestInfoRes.body.shopinterest).should.equal(shopinterest.shopinterest);
                        should.equal(shopinterestInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Shopinterest.remove().exec(done);
    });
  });
});
