'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shippingmaster = mongoose.model('Shippingmaster'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  shippingmaster;

/**
 * Shippingmaster routes tests
 */
describe('Shippingmaster CRUD tests', function () {

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

    // Save a user to the test db and create new Shippingmaster
    user.save(function () {
      shippingmaster = {
        name: 'Shippingmaster name',
        detail: 'Detail'
      };

      done();
    });
  });

  it('should be able to save a Shippingmaster if logged in', function (done) {
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

        // Save a new Shippingmaster
        agent.post('/api/shippingmasters')
          .send(shippingmaster)
          .expect(200)
          .end(function (shippingmasterSaveErr, shippingmasterSaveRes) {
            // Handle Shippingmaster save error
            if (shippingmasterSaveErr) {
              return done(shippingmasterSaveErr);
            }

            // Get a list of Shippingmasters
            agent.get('/api/shippingmasters')
              .end(function (shippingmastersGetErr, shippingmastersGetRes) {
                // Handle Shippingmasters save error
                if (shippingmastersGetErr) {
                  return done(shippingmastersGetErr);
                }

                // Get Shippingmasters list
                var shippingmasters = shippingmastersGetRes.body;

                // Set assertions
                (shippingmasters[0].user._id).should.equal(userId);
                (shippingmasters[0].name).should.match('Shippingmaster name');
                (shippingmasters[0].detail).should.match('Detail');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Shippingmaster if not logged in', function (done) {
    agent.post('/api/shippingmasters')
      .send(shippingmaster)
      .expect(403)
      .end(function (shippingmasterSaveErr, shippingmasterSaveRes) {
        // Call the assertion callback
        done(shippingmasterSaveErr);
      });
  });

  it('should not be able to save an Shippingmaster if no name is provided', function (done) {
    // Invalidate name field
    shippingmaster.name = '';

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

        // Save a new Shippingmaster
        agent.post('/api/shippingmasters')
          .send(shippingmaster)
          .expect(400)
          .end(function (shippingmasterSaveErr, shippingmasterSaveRes) {
            // Set message assertion
            (shippingmasterSaveRes.body.message).should.match('Please fill Shippingmaster name');

            // Handle Shippingmaster save error
            done(shippingmasterSaveErr);
          });
      });
  });

  it('should be able to update an Shippingmaster if signed in', function (done) {
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

        // Save a new Shippingmaster
        agent.post('/api/shippingmasters')
          .send(shippingmaster)
          .expect(200)
          .end(function (shippingmasterSaveErr, shippingmasterSaveRes) {
            // Handle Shippingmaster save error
            if (shippingmasterSaveErr) {
              return done(shippingmasterSaveErr);
            }

            // Update Shippingmaster name
            shippingmaster.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Shippingmaster
            agent.put('/api/shippingmasters/' + shippingmasterSaveRes.body._id)
              .send(shippingmaster)
              .expect(200)
              .end(function (shippingmasterUpdateErr, shippingmasterUpdateRes) {
                // Handle Shippingmaster update error
                if (shippingmasterUpdateErr) {
                  return done(shippingmasterUpdateErr);
                }

                // Set assertions
                (shippingmasterUpdateRes.body._id).should.equal(shippingmasterSaveRes.body._id);
                (shippingmasterUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Shippingmasters if not signed in', function (done) {
    // Create new Shippingmaster model instance
    var shippingmasterObj = new Shippingmaster(shippingmaster);

    // Save the shippingmaster
    shippingmasterObj.save(function () {
      // Request Shippingmasters
      request(app).get('/api/shippingmasters')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Shippingmaster if not signed in', function (done) {
    // Create new Shippingmaster model instance
    var shippingmasterObj = new Shippingmaster(shippingmaster);

    // Save the Shippingmaster
    shippingmasterObj.save(function () {
      request(app).get('/api/shippingmasters/' + shippingmasterObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', shippingmaster.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Shippingmaster with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/shippingmasters/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Shippingmaster is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Shippingmaster which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Shippingmaster
    request(app).get('/api/shippingmasters/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Shippingmaster with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Shippingmaster if signed in', function (done) {
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

        // Save a new Shippingmaster
        agent.post('/api/shippingmasters')
          .send(shippingmaster)
          .expect(200)
          .end(function (shippingmasterSaveErr, shippingmasterSaveRes) {
            // Handle Shippingmaster save error
            if (shippingmasterSaveErr) {
              return done(shippingmasterSaveErr);
            }

            // Delete an existing Shippingmaster
            agent.delete('/api/shippingmasters/' + shippingmasterSaveRes.body._id)
              .send(shippingmaster)
              .expect(200)
              .end(function (shippingmasterDeleteErr, shippingmasterDeleteRes) {
                // Handle shippingmaster error error
                if (shippingmasterDeleteErr) {
                  return done(shippingmasterDeleteErr);
                }

                // Set assertions
                (shippingmasterDeleteRes.body._id).should.equal(shippingmasterSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Shippingmaster if not signed in', function (done) {
    // Set Shippingmaster user
    shippingmaster.user = user;

    // Create new Shippingmaster model instance
    var shippingmasterObj = new Shippingmaster(shippingmaster);

    // Save the Shippingmaster
    shippingmasterObj.save(function () {
      // Try deleting Shippingmaster
      request(app).delete('/api/shippingmasters/' + shippingmasterObj._id)
        .expect(403)
        .end(function (shippingmasterDeleteErr, shippingmasterDeleteRes) {
          // Set message assertion
          (shippingmasterDeleteRes.body.message).should.match('User is not authorized');

          // Handle Shippingmaster error error
          done(shippingmasterDeleteErr);
        });

    });
  });

  it('should be able to get a single Shippingmaster that has an orphaned user reference', function (done) {
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

          // Save a new Shippingmaster
          agent.post('/api/shippingmasters')
            .send(shippingmaster)
            .expect(200)
            .end(function (shippingmasterSaveErr, shippingmasterSaveRes) {
              // Handle Shippingmaster save error
              if (shippingmasterSaveErr) {
                return done(shippingmasterSaveErr);
              }

              // Set assertions on new Shippingmaster
              (shippingmasterSaveRes.body.name).should.equal(shippingmaster.name);
              should.exist(shippingmasterSaveRes.body.user);
              should.equal(shippingmasterSaveRes.body.user._id, orphanId);

              // force the Shippingmaster to have an orphaned user reference
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

                    // Get the Shippingmaster
                    agent.get('/api/shippingmasters/' + shippingmasterSaveRes.body._id)
                      .expect(200)
                      .end(function (shippingmasterInfoErr, shippingmasterInfoRes) {
                        // Handle Shippingmaster error
                        if (shippingmasterInfoErr) {
                          return done(shippingmasterInfoErr);
                        }

                        // Set assertions
                        (shippingmasterInfoRes.body._id).should.equal(shippingmasterSaveRes.body._id);
                        (shippingmasterInfoRes.body.name).should.equal(shippingmaster.name);
                        should.equal(shippingmasterInfoRes.body.user, undefined);

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
      Shippingmaster.remove().exec(done);
    });
  });
});
