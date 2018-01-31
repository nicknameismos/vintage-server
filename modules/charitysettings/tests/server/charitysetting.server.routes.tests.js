'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Charitysetting = mongoose.model('Charitysetting'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  charitysetting;

/**
 * Charitysetting routes tests
 */
describe('Charitysetting CRUD tests', function () {

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

    // Save a user to the test db and create new Charitysetting
    user.save(function () {
      charitysetting = {
        name: 'Charitysetting name'
      };

      done();
    });
  });

  it('should be able to save a Charitysetting if logged in', function (done) {
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

        // Save a new Charitysetting
        agent.post('/api/charitysettings')
          .send(charitysetting)
          .expect(200)
          .end(function (charitysettingSaveErr, charitysettingSaveRes) {
            // Handle Charitysetting save error
            if (charitysettingSaveErr) {
              return done(charitysettingSaveErr);
            }

            // Get a list of Charitysettings
            agent.get('/api/charitysettings')
              .end(function (charitysettingsGetErr, charitysettingsGetRes) {
                // Handle Charitysettings save error
                if (charitysettingsGetErr) {
                  return done(charitysettingsGetErr);
                }

                // Get Charitysettings list
                var charitysettings = charitysettingsGetRes.body;

                // Set assertions
                (charitysettings[0].user._id).should.equal(userId);
                (charitysettings[0].name).should.match('Charitysetting name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Charitysetting if not logged in', function (done) {
    agent.post('/api/charitysettings')
      .send(charitysetting)
      .expect(403)
      .end(function (charitysettingSaveErr, charitysettingSaveRes) {
        // Call the assertion callback
        done(charitysettingSaveErr);
      });
  });

  it('should not be able to save an Charitysetting if no name is provided', function (done) {
    // Invalidate name field
    charitysetting.name = '';

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

        // Save a new Charitysetting
        agent.post('/api/charitysettings')
          .send(charitysetting)
          .expect(400)
          .end(function (charitysettingSaveErr, charitysettingSaveRes) {
            // Set message assertion
            (charitysettingSaveRes.body.message).should.match('Please fill Charitysetting name');

            // Handle Charitysetting save error
            done(charitysettingSaveErr);
          });
      });
  });

  it('should be able to update an Charitysetting if signed in', function (done) {
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

        // Save a new Charitysetting
        agent.post('/api/charitysettings')
          .send(charitysetting)
          .expect(200)
          .end(function (charitysettingSaveErr, charitysettingSaveRes) {
            // Handle Charitysetting save error
            if (charitysettingSaveErr) {
              return done(charitysettingSaveErr);
            }

            // Update Charitysetting name
            charitysetting.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Charitysetting
            agent.put('/api/charitysettings/' + charitysettingSaveRes.body._id)
              .send(charitysetting)
              .expect(200)
              .end(function (charitysettingUpdateErr, charitysettingUpdateRes) {
                // Handle Charitysetting update error
                if (charitysettingUpdateErr) {
                  return done(charitysettingUpdateErr);
                }

                // Set assertions
                (charitysettingUpdateRes.body._id).should.equal(charitysettingSaveRes.body._id);
                (charitysettingUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Charitysettings if not signed in', function (done) {
    // Create new Charitysetting model instance
    var charitysettingObj = new Charitysetting(charitysetting);

    // Save the charitysetting
    charitysettingObj.save(function () {
      // Request Charitysettings
      request(app).get('/api/charitysettings')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Charitysetting if not signed in', function (done) {
    // Create new Charitysetting model instance
    var charitysettingObj = new Charitysetting(charitysetting);

    // Save the Charitysetting
    charitysettingObj.save(function () {
      request(app).get('/api/charitysettings/' + charitysettingObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', charitysetting.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Charitysetting with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/charitysettings/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Charitysetting is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Charitysetting which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Charitysetting
    request(app).get('/api/charitysettings/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Charitysetting with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Charitysetting if signed in', function (done) {
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

        // Save a new Charitysetting
        agent.post('/api/charitysettings')
          .send(charitysetting)
          .expect(200)
          .end(function (charitysettingSaveErr, charitysettingSaveRes) {
            // Handle Charitysetting save error
            if (charitysettingSaveErr) {
              return done(charitysettingSaveErr);
            }

            // Delete an existing Charitysetting
            agent.delete('/api/charitysettings/' + charitysettingSaveRes.body._id)
              .send(charitysetting)
              .expect(200)
              .end(function (charitysettingDeleteErr, charitysettingDeleteRes) {
                // Handle charitysetting error error
                if (charitysettingDeleteErr) {
                  return done(charitysettingDeleteErr);
                }

                // Set assertions
                (charitysettingDeleteRes.body._id).should.equal(charitysettingSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Charitysetting if not signed in', function (done) {
    // Set Charitysetting user
    charitysetting.user = user;

    // Create new Charitysetting model instance
    var charitysettingObj = new Charitysetting(charitysetting);

    // Save the Charitysetting
    charitysettingObj.save(function () {
      // Try deleting Charitysetting
      request(app).delete('/api/charitysettings/' + charitysettingObj._id)
        .expect(403)
        .end(function (charitysettingDeleteErr, charitysettingDeleteRes) {
          // Set message assertion
          (charitysettingDeleteRes.body.message).should.match('User is not authorized');

          // Handle Charitysetting error error
          done(charitysettingDeleteErr);
        });

    });
  });

  it('should be able to get a single Charitysetting that has an orphaned user reference', function (done) {
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

          // Save a new Charitysetting
          agent.post('/api/charitysettings')
            .send(charitysetting)
            .expect(200)
            .end(function (charitysettingSaveErr, charitysettingSaveRes) {
              // Handle Charitysetting save error
              if (charitysettingSaveErr) {
                return done(charitysettingSaveErr);
              }

              // Set assertions on new Charitysetting
              (charitysettingSaveRes.body.name).should.equal(charitysetting.name);
              should.exist(charitysettingSaveRes.body.user);
              should.equal(charitysettingSaveRes.body.user._id, orphanId);

              // force the Charitysetting to have an orphaned user reference
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

                    // Get the Charitysetting
                    agent.get('/api/charitysettings/' + charitysettingSaveRes.body._id)
                      .expect(200)
                      .end(function (charitysettingInfoErr, charitysettingInfoRes) {
                        // Handle Charitysetting error
                        if (charitysettingInfoErr) {
                          return done(charitysettingInfoErr);
                        }

                        // Set assertions
                        (charitysettingInfoRes.body._id).should.equal(charitysettingSaveRes.body._id);
                        (charitysettingInfoRes.body.name).should.equal(charitysetting.name);
                        should.equal(charitysettingInfoRes.body.user, undefined);

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
      Charitysetting.remove().exec(done);
    });
  });
});
