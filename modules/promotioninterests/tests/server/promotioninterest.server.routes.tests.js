'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Promotioninterest = mongoose.model('Promotioninterest'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  promotioninterest;

/**
 * Promotioninterest routes tests
 */
describe('Promotioninterest CRUD tests', function () {

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

    // Save a user to the test db and create new Promotioninterest
    user.save(function () {
      promotioninterest = {
        promotioninterest: 'Promotioninterest name'
      };

      done();
    });
  });

  it('should be able to save a Promotioninterest if logged in', function (done) {
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

        // Save a new Promotioninterest
        agent.post('/api/promotioninterests')
          .send(promotioninterest)
          .expect(200)
          .end(function (promotioninterestSaveErr, promotioninterestSaveRes) {
            // Handle Promotioninterest save error
            if (promotioninterestSaveErr) {
              return done(promotioninterestSaveErr);
            }

            // Get a list of Promotioninterests
            agent.get('/api/promotioninterests')
              .end(function (promotioninterestsGetErr, promotioninterestsGetRes) {
                // Handle Promotioninterests save error
                if (promotioninterestsGetErr) {
                  return done(promotioninterestsGetErr);
                }

                // Get Promotioninterests list
                var promotioninterests = promotioninterestsGetRes.body.items;

                // Set assertions
                (promotioninterests[0].user._id).should.equal(userId);
                (promotioninterests[0].promotioninterest).should.match('Promotioninterest name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Promotioninterest if not logged in', function (done) {
    agent.post('/api/promotioninterests')
      .send(promotioninterest)
      .expect(403)
      .end(function (promotioninterestSaveErr, promotioninterestSaveRes) {
        // Call the assertion callback
        done(promotioninterestSaveErr);
      });
  });

  it('should not be able to save an Promotioninterest if no promotioninterest is provided', function (done) {
    // Invalidate promotioninterest field
    promotioninterest.promotioninterest = '';

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

        // Save a new Promotioninterest
        agent.post('/api/promotioninterests')
          .send(promotioninterest)
          .expect(400)
          .end(function (promotioninterestSaveErr, promotioninterestSaveRes) {
            // Set message assertion
            (promotioninterestSaveRes.body.message).should.match('Please fill Promotioninterest name');

            // Handle Promotioninterest save error
            done(promotioninterestSaveErr);
          });
      });
  });

  it('should be able to update an Promotioninterest if signed in', function (done) {
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

        // Save a new Promotioninterest
        agent.post('/api/promotioninterests')
          .send(promotioninterest)
          .expect(200)
          .end(function (promotioninterestSaveErr, promotioninterestSaveRes) {
            // Handle Promotioninterest save error
            if (promotioninterestSaveErr) {
              return done(promotioninterestSaveErr);
            }

            // Update Promotioninterest promotioninterest
            promotioninterest.promotioninterest = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Promotioninterest
            agent.put('/api/promotioninterests/' + promotioninterestSaveRes.body._id)
              .send(promotioninterest)
              .expect(200)
              .end(function (promotioninterestUpdateErr, promotioninterestUpdateRes) {
                // Handle Promotioninterest update error
                if (promotioninterestUpdateErr) {
                  return done(promotioninterestUpdateErr);
                }

                // Set assertions
                (promotioninterestUpdateRes.body._id).should.equal(promotioninterestSaveRes.body._id);
                (promotioninterestUpdateRes.body.promotioninterest).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Promotioninterests if not signed in', function (done) {
    // Create new Promotioninterest model instance
    var promotioninterestObj = new Promotioninterest(promotioninterest);

    // Save the promotioninterest
    promotioninterestObj.save(function () {
      // Request Promotioninterests
      request(app).get('/api/promotioninterests')
        .end(function (req, res) {
          // Set assertion
          res.body.items.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Promotioninterest if not signed in', function (done) {
    // Create new Promotioninterest model instance
    var promotioninterestObj = new Promotioninterest(promotioninterest);

    // Save the Promotioninterest
    promotioninterestObj.save(function () {
      request(app).get('/api/promotioninterests/' + promotioninterestObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('promotioninterest', promotioninterest.promotioninterest);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Promotioninterest with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/promotioninterests/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Promotioninterest is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Promotioninterest which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Promotioninterest
    request(app).get('/api/promotioninterests/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Promotioninterest with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Promotioninterest if signed in', function (done) {
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

        // Save a new Promotioninterest
        agent.post('/api/promotioninterests')
          .send(promotioninterest)
          .expect(200)
          .end(function (promotioninterestSaveErr, promotioninterestSaveRes) {
            // Handle Promotioninterest save error
            if (promotioninterestSaveErr) {
              return done(promotioninterestSaveErr);
            }

            // Delete an existing Promotioninterest
            agent.delete('/api/promotioninterests/' + promotioninterestSaveRes.body._id)
              .send(promotioninterest)
              .expect(200)
              .end(function (promotioninterestDeleteErr, promotioninterestDeleteRes) {
                // Handle promotioninterest error error
                if (promotioninterestDeleteErr) {
                  return done(promotioninterestDeleteErr);
                }

                // Set assertions
                (promotioninterestDeleteRes.body._id).should.equal(promotioninterestSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Promotioninterest if not signed in', function (done) {
    // Set Promotioninterest user
    promotioninterest.user = user;

    // Create new Promotioninterest model instance
    var promotioninterestObj = new Promotioninterest(promotioninterest);

    // Save the Promotioninterest
    promotioninterestObj.save(function () {
      // Try deleting Promotioninterest
      request(app).delete('/api/promotioninterests/' + promotioninterestObj._id)
        .expect(403)
        .end(function (promotioninterestDeleteErr, promotioninterestDeleteRes) {
          // Set message assertion
          (promotioninterestDeleteRes.body.message).should.match('User is not authorized');

          // Handle Promotioninterest error error
          done(promotioninterestDeleteErr);
        });

    });
  });

  it('should be able to get a single Promotioninterest that has an orphaned user reference', function (done) {
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

          // Save a new Promotioninterest
          agent.post('/api/promotioninterests')
            .send(promotioninterest)
            .expect(200)
            .end(function (promotioninterestSaveErr, promotioninterestSaveRes) {
              // Handle Promotioninterest save error
              if (promotioninterestSaveErr) {
                return done(promotioninterestSaveErr);
              }

              // Set assertions on new Promotioninterest
              (promotioninterestSaveRes.body.promotioninterest).should.equal(promotioninterest.promotioninterest);
              should.exist(promotioninterestSaveRes.body.user);
              should.equal(promotioninterestSaveRes.body.user._id, orphanId);

              // force the Promotioninterest to have an orphaned user reference
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

                    // Get the Promotioninterest
                    agent.get('/api/promotioninterests/' + promotioninterestSaveRes.body._id)
                      .expect(200)
                      .end(function (promotioninterestInfoErr, promotioninterestInfoRes) {
                        // Handle Promotioninterest error
                        if (promotioninterestInfoErr) {
                          return done(promotioninterestInfoErr);
                        }

                        // Set assertions
                        (promotioninterestInfoRes.body._id).should.equal(promotioninterestSaveRes.body._id);
                        (promotioninterestInfoRes.body.promotioninterest).should.equal(promotioninterest.promotioninterest);
                        should.equal(promotioninterestInfoRes.body.user, undefined);

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
      Promotioninterest.remove().exec(done);
    });
  });
});
