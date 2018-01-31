'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Coinbalance = mongoose.model('Coinbalance'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  coinbalance;

/**
 * Coinbalance routes tests
 */
describe('Coinbalance CRUD tests', function () {

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

    // Save a user to the test db and create new Coinbalance
    user.save(function () {
      coinbalance = {
        name: 'newreg',
        balancetype: 'in',
        volume: 5,
        user: user
      };

      done();
    });
  });

  it('should be able to save a Coinbalance if logged in', function (done) {
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

        // Save a new Coinbalance
        agent.post('/api/coinbalances')
          .send(coinbalance)
          .expect(200)
          .end(function (coinbalanceSaveErr, coinbalanceSaveRes) {
            // Handle Coinbalance save error
            if (coinbalanceSaveErr) {
              return done(coinbalanceSaveErr);
            }

            // Get a list of Coinbalances
            agent.get('/api/coinbalances')
              .end(function (coinbalancesGetErr, coinbalancesGetRes) {
                // Handle Coinbalances save error
                if (coinbalancesGetErr) {
                  return done(coinbalancesGetErr);
                }

                // Get Coinbalances list
                var coinbalances = coinbalancesGetRes.body;

                // Set assertions
                (coinbalances[0].user._id).should.equal(userId);
                (coinbalances[0].name).should.match('newreg');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Coinbalance if not logged in', function (done) {
    agent.post('/api/coinbalances')
      .send(coinbalance)
      .expect(403)
      .end(function (coinbalanceSaveErr, coinbalanceSaveRes) {
        // Call the assertion callback
        done(coinbalanceSaveErr);
      });
  });

  it('should not be able to save an Coinbalance if no name is provided', function (done) {
    // Invalidate name field
    coinbalance.name = '';

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

        // Save a new Coinbalance
        agent.post('/api/coinbalances')
          .send(coinbalance)
          .expect(400)
          .end(function (coinbalanceSaveErr, coinbalanceSaveRes) {
            // Set message assertion
            (coinbalanceSaveRes.body.message).should.match('Please fill Coinbalance name');

            // Handle Coinbalance save error
            done(coinbalanceSaveErr);
          });
      });
  });

  it('should be able to update an Coinbalance if signed in', function (done) {
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

        // Save a new Coinbalance
        agent.post('/api/coinbalances')
          .send(coinbalance)
          .expect(200)
          .end(function (coinbalanceSaveErr, coinbalanceSaveRes) {
            // Handle Coinbalance save error
            if (coinbalanceSaveErr) {
              return done(coinbalanceSaveErr);
            }

            // Update Coinbalance name
            coinbalance.name = 'login';

            // Update an existing Coinbalance
            agent.put('/api/coinbalances/' + coinbalanceSaveRes.body._id)
              .send(coinbalance)
              .expect(200)
              .end(function (coinbalanceUpdateErr, coinbalanceUpdateRes) {
                // Handle Coinbalance update error
                if (coinbalanceUpdateErr) {
                  return done(coinbalanceUpdateErr);
                }

                // Set assertions
                (coinbalanceUpdateRes.body._id).should.equal(coinbalanceSaveRes.body._id);
                (coinbalanceUpdateRes.body.name).should.match('login');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Coinbalances if not signed in', function (done) {
    // Create new Coinbalance model instance
    var coinbalanceObj = new Coinbalance(coinbalance);

    // Save the coinbalance
    coinbalanceObj.save(function () {
      // Request Coinbalances
      request(app).get('/api/coinbalances')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Coinbalance if not signed in', function (done) {
    // Create new Coinbalance model instance
    var coinbalanceObj = new Coinbalance(coinbalance);

    // Save the Coinbalance
    coinbalanceObj.save(function () {
      request(app).get('/api/coinbalances/' + coinbalanceObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', coinbalance.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Coinbalance with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/coinbalances/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Coinbalance is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Coinbalance which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Coinbalance
    request(app).get('/api/coinbalances/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Coinbalance with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Coinbalance if signed in', function (done) {
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

        // Save a new Coinbalance
        agent.post('/api/coinbalances')
          .send(coinbalance)
          .expect(200)
          .end(function (coinbalanceSaveErr, coinbalanceSaveRes) {
            // Handle Coinbalance save error
            if (coinbalanceSaveErr) {
              return done(coinbalanceSaveErr);
            }

            // Delete an existing Coinbalance
            agent.delete('/api/coinbalances/' + coinbalanceSaveRes.body._id)
              .send(coinbalance)
              .expect(200)
              .end(function (coinbalanceDeleteErr, coinbalanceDeleteRes) {
                // Handle coinbalance error error
                if (coinbalanceDeleteErr) {
                  return done(coinbalanceDeleteErr);
                }

                // Set assertions
                (coinbalanceDeleteRes.body._id).should.equal(coinbalanceSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Coinbalance if not signed in', function (done) {
    // Set Coinbalance user
    coinbalance.user = user;

    // Create new Coinbalance model instance
    var coinbalanceObj = new Coinbalance(coinbalance);

    // Save the Coinbalance
    coinbalanceObj.save(function () {
      // Try deleting Coinbalance
      request(app).delete('/api/coinbalances/' + coinbalanceObj._id)
        .expect(403)
        .end(function (coinbalanceDeleteErr, coinbalanceDeleteRes) {
          // Set message assertion
          (coinbalanceDeleteRes.body.message).should.match('User is not authorized');

          // Handle Coinbalance error error
          done(coinbalanceDeleteErr);
        });

    });
  });

  it('should be able to get a single Coinbalance that has an orphaned user reference', function (done) {
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

          // Save a new Coinbalance
          agent.post('/api/coinbalances')
            .send(coinbalance)
            .expect(200)
            .end(function (coinbalanceSaveErr, coinbalanceSaveRes) {
              // Handle Coinbalance save error
              if (coinbalanceSaveErr) {
                return done(coinbalanceSaveErr);
              }

              // Set assertions on new Coinbalance
              (coinbalanceSaveRes.body.name).should.equal(coinbalance.name);
              should.exist(coinbalanceSaveRes.body.user);
              should.equal(coinbalanceSaveRes.body.user._id, orphanId);

              // force the Coinbalance to have an orphaned user reference
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

                    // Get the Coinbalance
                    agent.get('/api/coinbalances/' + coinbalanceSaveRes.body._id)
                      .expect(200)
                      .end(function (coinbalanceInfoErr, coinbalanceInfoRes) {
                        // Handle Coinbalance error
                        if (coinbalanceInfoErr) {
                          return done(coinbalanceInfoErr);
                        }

                        // Set assertions
                        (coinbalanceInfoRes.body._id).should.equal(coinbalanceSaveRes.body._id);
                        (coinbalanceInfoRes.body.name).should.equal(coinbalance.name);
                        should.equal(coinbalanceInfoRes.body.user, undefined);

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
      Coinbalance.remove().exec(done);
    });
  });
});
