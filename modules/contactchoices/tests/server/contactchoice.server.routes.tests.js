'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Contactchoice = mongoose.model('Contactchoice'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  contactchoice;

/**
 * Contactchoice routes tests
 */
describe('Contactchoice CRUD tests', function () {

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

    // Save a user to the test db and create new Contactchoice
    user.save(function () {
      contactchoice = {
        name: 'Contactchoice name'
      };

      done();
    });
  });

  it('should be able to save a Contactchoice if logged in', function (done) {
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

        // Save a new Contactchoice
        agent.post('/api/contactchoices')
          .send(contactchoice)
          .expect(200)
          .end(function (contactchoiceSaveErr, contactchoiceSaveRes) {
            // Handle Contactchoice save error
            if (contactchoiceSaveErr) {
              return done(contactchoiceSaveErr);
            }

            // Get a list of Contactchoices
            agent.get('/api/contactchoices')
              .end(function (contactchoicesGetErr, contactchoicesGetRes) {
                // Handle Contactchoices save error
                if (contactchoicesGetErr) {
                  return done(contactchoicesGetErr);
                }

                // Get Contactchoices list
                var contactchoices = contactchoicesGetRes.body;

                // Set assertions
                (contactchoices[0].user._id).should.equal(userId);
                (contactchoices[0].name).should.match('Contactchoice name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Contactchoice if not logged in', function (done) {
    agent.post('/api/contactchoices')
      .send(contactchoice)
      .expect(403)
      .end(function (contactchoiceSaveErr, contactchoiceSaveRes) {
        // Call the assertion callback
        done(contactchoiceSaveErr);
      });
  });

  it('should not be able to save an Contactchoice if no name is provided', function (done) {
    // Invalidate name field
    contactchoice.name = '';

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

        // Save a new Contactchoice
        agent.post('/api/contactchoices')
          .send(contactchoice)
          .expect(400)
          .end(function (contactchoiceSaveErr, contactchoiceSaveRes) {
            // Set message assertion
            (contactchoiceSaveRes.body.message).should.match('Please fill Contactchoice name');

            // Handle Contactchoice save error
            done(contactchoiceSaveErr);
          });
      });
  });

  it('should be able to update an Contactchoice if signed in', function (done) {
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

        // Save a new Contactchoice
        agent.post('/api/contactchoices')
          .send(contactchoice)
          .expect(200)
          .end(function (contactchoiceSaveErr, contactchoiceSaveRes) {
            // Handle Contactchoice save error
            if (contactchoiceSaveErr) {
              return done(contactchoiceSaveErr);
            }

            // Update Contactchoice name
            contactchoice.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Contactchoice
            agent.put('/api/contactchoices/' + contactchoiceSaveRes.body._id)
              .send(contactchoice)
              .expect(200)
              .end(function (contactchoiceUpdateErr, contactchoiceUpdateRes) {
                // Handle Contactchoice update error
                if (contactchoiceUpdateErr) {
                  return done(contactchoiceUpdateErr);
                }

                // Set assertions
                (contactchoiceUpdateRes.body._id).should.equal(contactchoiceSaveRes.body._id);
                (contactchoiceUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Contactchoices if not signed in', function (done) {
    // Create new Contactchoice model instance
    var contactchoiceObj = new Contactchoice(contactchoice);

    // Save the contactchoice
    contactchoiceObj.save(function () {
      // Request Contactchoices
      request(app).get('/api/contactchoices')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Contactchoice if not signed in', function (done) {
    // Create new Contactchoice model instance
    var contactchoiceObj = new Contactchoice(contactchoice);

    // Save the Contactchoice
    contactchoiceObj.save(function () {
      request(app).get('/api/contactchoices/' + contactchoiceObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', contactchoice.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Contactchoice with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/contactchoices/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Contactchoice is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Contactchoice which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Contactchoice
    request(app).get('/api/contactchoices/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Contactchoice with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Contactchoice if signed in', function (done) {
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

        // Save a new Contactchoice
        agent.post('/api/contactchoices')
          .send(contactchoice)
          .expect(200)
          .end(function (contactchoiceSaveErr, contactchoiceSaveRes) {
            // Handle Contactchoice save error
            if (contactchoiceSaveErr) {
              return done(contactchoiceSaveErr);
            }

            // Delete an existing Contactchoice
            agent.delete('/api/contactchoices/' + contactchoiceSaveRes.body._id)
              .send(contactchoice)
              .expect(200)
              .end(function (contactchoiceDeleteErr, contactchoiceDeleteRes) {
                // Handle contactchoice error error
                if (contactchoiceDeleteErr) {
                  return done(contactchoiceDeleteErr);
                }

                // Set assertions
                (contactchoiceDeleteRes.body._id).should.equal(contactchoiceSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Contactchoice if not signed in', function (done) {
    // Set Contactchoice user
    contactchoice.user = user;

    // Create new Contactchoice model instance
    var contactchoiceObj = new Contactchoice(contactchoice);

    // Save the Contactchoice
    contactchoiceObj.save(function () {
      // Try deleting Contactchoice
      request(app).delete('/api/contactchoices/' + contactchoiceObj._id)
        .expect(403)
        .end(function (contactchoiceDeleteErr, contactchoiceDeleteRes) {
          // Set message assertion
          (contactchoiceDeleteRes.body.message).should.match('User is not authorized');

          // Handle Contactchoice error error
          done(contactchoiceDeleteErr);
        });

    });
  });

  it('should be able to get a single Contactchoice that has an orphaned user reference', function (done) {
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

          // Save a new Contactchoice
          agent.post('/api/contactchoices')
            .send(contactchoice)
            .expect(200)
            .end(function (contactchoiceSaveErr, contactchoiceSaveRes) {
              // Handle Contactchoice save error
              if (contactchoiceSaveErr) {
                return done(contactchoiceSaveErr);
              }

              // Set assertions on new Contactchoice
              (contactchoiceSaveRes.body.name).should.equal(contactchoice.name);
              should.exist(contactchoiceSaveRes.body.user);
              should.equal(contactchoiceSaveRes.body.user._id, orphanId);

              // force the Contactchoice to have an orphaned user reference
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

                    // Get the Contactchoice
                    agent.get('/api/contactchoices/' + contactchoiceSaveRes.body._id)
                      .expect(200)
                      .end(function (contactchoiceInfoErr, contactchoiceInfoRes) {
                        // Handle Contactchoice error
                        if (contactchoiceInfoErr) {
                          return done(contactchoiceInfoErr);
                        }

                        // Set assertions
                        (contactchoiceInfoRes.body._id).should.equal(contactchoiceSaveRes.body._id);
                        (contactchoiceInfoRes.body.name).should.equal(contactchoice.name);
                        should.equal(contactchoiceInfoRes.body.user, undefined);

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
      Contactchoice.remove().exec(done);
    });
  });
});
