'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Campaignmaster = mongoose.model('Campaignmaster'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  campaignmaster;

/**
 * Campaignmaster routes tests
 */
describe('Campaignmaster CRUD tests', function () {

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

    // Save a user to the test db and create new Campaignmaster
    user.save(function () {
      campaignmaster = {
        name: 'Campaignmaster name'
      };

      done();
    });
  });

  it('should be able to save a Campaignmaster if logged in', function (done) {
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

        // Save a new Campaignmaster
        agent.post('/api/campaignmasters')
          .send(campaignmaster)
          .expect(200)
          .end(function (campaignmasterSaveErr, campaignmasterSaveRes) {
            // Handle Campaignmaster save error
            if (campaignmasterSaveErr) {
              return done(campaignmasterSaveErr);
            }

            // Get a list of Campaignmasters
            agent.get('/api/campaignmasters')
              .end(function (campaignmastersGetErr, campaignmastersGetRes) {
                // Handle Campaignmasters save error
                if (campaignmastersGetErr) {
                  return done(campaignmastersGetErr);
                }

                // Get Campaignmasters list
                var campaignmasters = campaignmastersGetRes.body;

                // Set assertions
                (campaignmasters[0].user._id).should.equal(userId);
                (campaignmasters[0].name).should.match('Campaignmaster name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Campaignmaster if not logged in', function (done) {
    agent.post('/api/campaignmasters')
      .send(campaignmaster)
      .expect(403)
      .end(function (campaignmasterSaveErr, campaignmasterSaveRes) {
        // Call the assertion callback
        done(campaignmasterSaveErr);
      });
  });

  it('should not be able to save an Campaignmaster if no name is provided', function (done) {
    // Invalidate name field
    campaignmaster.name = '';

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

        // Save a new Campaignmaster
        agent.post('/api/campaignmasters')
          .send(campaignmaster)
          .expect(400)
          .end(function (campaignmasterSaveErr, campaignmasterSaveRes) {
            // Set message assertion
            (campaignmasterSaveRes.body.message).should.match('Please fill Campaignmaster name');

            // Handle Campaignmaster save error
            done(campaignmasterSaveErr);
          });
      });
  });

  it('should be able to update an Campaignmaster if signed in', function (done) {
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

        // Save a new Campaignmaster
        agent.post('/api/campaignmasters')
          .send(campaignmaster)
          .expect(200)
          .end(function (campaignmasterSaveErr, campaignmasterSaveRes) {
            // Handle Campaignmaster save error
            if (campaignmasterSaveErr) {
              return done(campaignmasterSaveErr);
            }

            // Update Campaignmaster name
            campaignmaster.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Campaignmaster
            agent.put('/api/campaignmasters/' + campaignmasterSaveRes.body._id)
              .send(campaignmaster)
              .expect(200)
              .end(function (campaignmasterUpdateErr, campaignmasterUpdateRes) {
                // Handle Campaignmaster update error
                if (campaignmasterUpdateErr) {
                  return done(campaignmasterUpdateErr);
                }

                // Set assertions
                (campaignmasterUpdateRes.body._id).should.equal(campaignmasterSaveRes.body._id);
                (campaignmasterUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Campaignmasters if not signed in', function (done) {
    // Create new Campaignmaster model instance
    var campaignmasterObj = new Campaignmaster(campaignmaster);

    // Save the campaignmaster
    campaignmasterObj.save(function () {
      // Request Campaignmasters
      request(app).get('/api/campaignmasters')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Campaignmaster if not signed in', function (done) {
    // Create new Campaignmaster model instance
    var campaignmasterObj = new Campaignmaster(campaignmaster);

    // Save the Campaignmaster
    campaignmasterObj.save(function () {
      request(app).get('/api/campaignmasters/' + campaignmasterObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', campaignmaster.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Campaignmaster with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/campaignmasters/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Campaignmaster is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Campaignmaster which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Campaignmaster
    request(app).get('/api/campaignmasters/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Campaignmaster with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Campaignmaster if signed in', function (done) {
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

        // Save a new Campaignmaster
        agent.post('/api/campaignmasters')
          .send(campaignmaster)
          .expect(200)
          .end(function (campaignmasterSaveErr, campaignmasterSaveRes) {
            // Handle Campaignmaster save error
            if (campaignmasterSaveErr) {
              return done(campaignmasterSaveErr);
            }

            // Delete an existing Campaignmaster
            agent.delete('/api/campaignmasters/' + campaignmasterSaveRes.body._id)
              .send(campaignmaster)
              .expect(200)
              .end(function (campaignmasterDeleteErr, campaignmasterDeleteRes) {
                // Handle campaignmaster error error
                if (campaignmasterDeleteErr) {
                  return done(campaignmasterDeleteErr);
                }

                // Set assertions
                (campaignmasterDeleteRes.body._id).should.equal(campaignmasterSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Campaignmaster if not signed in', function (done) {
    // Set Campaignmaster user
    campaignmaster.user = user;

    // Create new Campaignmaster model instance
    var campaignmasterObj = new Campaignmaster(campaignmaster);

    // Save the Campaignmaster
    campaignmasterObj.save(function () {
      // Try deleting Campaignmaster
      request(app).delete('/api/campaignmasters/' + campaignmasterObj._id)
        .expect(403)
        .end(function (campaignmasterDeleteErr, campaignmasterDeleteRes) {
          // Set message assertion
          (campaignmasterDeleteRes.body.message).should.match('User is not authorized');

          // Handle Campaignmaster error error
          done(campaignmasterDeleteErr);
        });

    });
  });

  it('should be able to get a single Campaignmaster that has an orphaned user reference', function (done) {
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

          // Save a new Campaignmaster
          agent.post('/api/campaignmasters')
            .send(campaignmaster)
            .expect(200)
            .end(function (campaignmasterSaveErr, campaignmasterSaveRes) {
              // Handle Campaignmaster save error
              if (campaignmasterSaveErr) {
                return done(campaignmasterSaveErr);
              }

              // Set assertions on new Campaignmaster
              (campaignmasterSaveRes.body.name).should.equal(campaignmaster.name);
              should.exist(campaignmasterSaveRes.body.user);
              should.equal(campaignmasterSaveRes.body.user._id, orphanId);

              // force the Campaignmaster to have an orphaned user reference
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

                    // Get the Campaignmaster
                    agent.get('/api/campaignmasters/' + campaignmasterSaveRes.body._id)
                      .expect(200)
                      .end(function (campaignmasterInfoErr, campaignmasterInfoRes) {
                        // Handle Campaignmaster error
                        if (campaignmasterInfoErr) {
                          return done(campaignmasterInfoErr);
                        }

                        // Set assertions
                        (campaignmasterInfoRes.body._id).should.equal(campaignmasterSaveRes.body._id);
                        (campaignmasterInfoRes.body.name).should.equal(campaignmaster.name);
                        should.equal(campaignmasterInfoRes.body.user, undefined);

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
      Campaignmaster.remove().exec(done);
    });
  });
});
