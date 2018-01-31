'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Benefitsetting = mongoose.model('Benefitsetting'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  benefitsetting;

/**
 * Benefitsetting routes tests
 */
describe('Benefitsetting CRUD tests', function () {

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

    // Save a user to the test db and create new Benefitsetting
    user.save(function () {
      benefitsetting = {
        name: 'newreg',
        description: 'description of benefit',
        items: [{
          benefittype: 'coin',
          volume: 10
        }],
        user: user
      };

      done();
    });
  });

  it('should be able to save a Benefitsetting if logged in', function (done) {
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

        // Save a new Benefitsetting
        agent.post('/api/benefitsettings')
          .send(benefitsetting)
          .expect(200)
          .end(function (benefitsettingSaveErr, benefitsettingSaveRes) {
            // Handle Benefitsetting save error
            if (benefitsettingSaveErr) {
              return done(benefitsettingSaveErr);
            }

            // Get a list of Benefitsettings
            agent.get('/api/benefitsettings')
              .end(function (benefitsettingsGetErr, benefitsettingsGetRes) {
                // Handle Benefitsettings save error
                if (benefitsettingsGetErr) {
                  return done(benefitsettingsGetErr);
                }

                // Get Benefitsettings list
                var benefitsettings = benefitsettingsGetRes.body;

                // Set assertions
                (benefitsettings[0].user._id).should.equal(userId);
                (benefitsettings[0].name).should.match('newreg');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Benefitsetting if not logged in', function (done) {
    agent.post('/api/benefitsettings')
      .send(benefitsetting)
      .expect(403)
      .end(function (benefitsettingSaveErr, benefitsettingSaveRes) {
        // Call the assertion callback
        done(benefitsettingSaveErr);
      });
  });

  it('should not be able to save an Benefitsetting if no name is provided', function (done) {
    // Invalidate name field
    benefitsetting.name = '';

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

        // Save a new Benefitsetting
        agent.post('/api/benefitsettings')
          .send(benefitsetting)
          .expect(400)
          .end(function (benefitsettingSaveErr, benefitsettingSaveRes) {
            // Set message assertion
            (benefitsettingSaveRes.body.message).should.match('Please fill Benefitsetting name');

            // Handle Benefitsetting save error
            done(benefitsettingSaveErr);
          });
      });
  });

  it('should be able to update an Benefitsetting if signed in', function (done) {
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

        // Save a new Benefitsetting
        agent.post('/api/benefitsettings')
          .send(benefitsetting)
          .expect(200)
          .end(function (benefitsettingSaveErr, benefitsettingSaveRes) {
            // Handle Benefitsetting save error
            if (benefitsettingSaveErr) {
              return done(benefitsettingSaveErr);
            }

            // Update Benefitsetting name
            benefitsetting.name = 'login';

            // Update an existing Benefitsetting
            agent.put('/api/benefitsettings/' + benefitsettingSaveRes.body._id)
              .send(benefitsetting)
              .expect(200)
              .end(function (benefitsettingUpdateErr, benefitsettingUpdateRes) {
                // Handle Benefitsetting update error
                if (benefitsettingUpdateErr) {
                  return done(benefitsettingUpdateErr);
                }

                // Set assertions
                (benefitsettingUpdateRes.body._id).should.equal(benefitsettingSaveRes.body._id);
                (benefitsettingUpdateRes.body.name).should.match('login');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Benefitsettings if not signed in', function (done) {
    // Create new Benefitsetting model instance
    var benefitsettingObj = new Benefitsetting(benefitsetting);

    // Save the benefitsetting
    benefitsettingObj.save(function () {
      // Request Benefitsettings
      request(app).get('/api/benefitsettings')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Benefitsetting if not signed in', function (done) {
    // Create new Benefitsetting model instance
    var benefitsettingObj = new Benefitsetting(benefitsetting);

    // Save the Benefitsetting
    benefitsettingObj.save(function () {
      request(app).get('/api/benefitsettings/' + benefitsettingObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', benefitsetting.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Benefitsetting with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/benefitsettings/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Benefitsetting is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Benefitsetting which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Benefitsetting
    request(app).get('/api/benefitsettings/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Benefitsetting with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Benefitsetting if signed in', function (done) {
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

        // Save a new Benefitsetting
        agent.post('/api/benefitsettings')
          .send(benefitsetting)
          .expect(200)
          .end(function (benefitsettingSaveErr, benefitsettingSaveRes) {
            // Handle Benefitsetting save error
            if (benefitsettingSaveErr) {
              return done(benefitsettingSaveErr);
            }

            // Delete an existing Benefitsetting
            agent.delete('/api/benefitsettings/' + benefitsettingSaveRes.body._id)
              .send(benefitsetting)
              .expect(200)
              .end(function (benefitsettingDeleteErr, benefitsettingDeleteRes) {
                // Handle benefitsetting error error
                if (benefitsettingDeleteErr) {
                  return done(benefitsettingDeleteErr);
                }

                // Set assertions
                (benefitsettingDeleteRes.body._id).should.equal(benefitsettingSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Benefitsetting if not signed in', function (done) {
    // Set Benefitsetting user
    benefitsetting.user = user;

    // Create new Benefitsetting model instance
    var benefitsettingObj = new Benefitsetting(benefitsetting);

    // Save the Benefitsetting
    benefitsettingObj.save(function () {
      // Try deleting Benefitsetting
      request(app).delete('/api/benefitsettings/' + benefitsettingObj._id)
        .expect(403)
        .end(function (benefitsettingDeleteErr, benefitsettingDeleteRes) {
          // Set message assertion
          (benefitsettingDeleteRes.body.message).should.match('User is not authorized');

          // Handle Benefitsetting error error
          done(benefitsettingDeleteErr);
        });

    });
  });

  it('should be able to get a single Benefitsetting that has an orphaned user reference', function (done) {
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

          // Save a new Benefitsetting
          agent.post('/api/benefitsettings')
            .send(benefitsetting)
            .expect(200)
            .end(function (benefitsettingSaveErr, benefitsettingSaveRes) {
              // Handle Benefitsetting save error
              if (benefitsettingSaveErr) {
                return done(benefitsettingSaveErr);
              }

              // Set assertions on new Benefitsetting
              (benefitsettingSaveRes.body.name).should.equal(benefitsetting.name);
              should.exist(benefitsettingSaveRes.body.user);
              should.equal(benefitsettingSaveRes.body.user._id, orphanId);

              // force the Benefitsetting to have an orphaned user reference
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

                    // Get the Benefitsetting
                    agent.get('/api/benefitsettings/' + benefitsettingSaveRes.body._id)
                      .expect(200)
                      .end(function (benefitsettingInfoErr, benefitsettingInfoRes) {
                        // Handle Benefitsetting error
                        if (benefitsettingInfoErr) {
                          return done(benefitsettingInfoErr);
                        }

                        // Set assertions
                        (benefitsettingInfoRes.body._id).should.equal(benefitsettingSaveRes.body._id);
                        (benefitsettingInfoRes.body.name).should.equal(benefitsetting.name);
                        should.equal(benefitsettingInfoRes.body.user, undefined);

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
      Benefitsetting.remove().exec(done);
    });
  });
});
