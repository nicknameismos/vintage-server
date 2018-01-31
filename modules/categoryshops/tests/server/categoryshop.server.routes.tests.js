'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Categoryshop = mongoose.model('Categoryshop'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  categoryshop;

/**
 * Categoryshop routes tests
 */
describe('Categoryshop CRUD tests', function () {

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

    // Save a user to the test db and create new Categoryshop
    user.save(function () {
      categoryshop = {
        name: 'Categoryshop name'
      };

      done();
    });
  });

  it('should be able to save a Categoryshop if logged in', function (done) {
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

        // Save a new Categoryshop
        agent.post('/api/categoryshops')
          .send(categoryshop)
          .expect(200)
          .end(function (categoryshopSaveErr, categoryshopSaveRes) {
            // Handle Categoryshop save error
            if (categoryshopSaveErr) {
              return done(categoryshopSaveErr);
            }

            // Get a list of Categoryshops
            agent.get('/api/categoryshops')
              .end(function (categoryshopsGetErr, categoryshopsGetRes) {
                // Handle Categoryshops save error
                if (categoryshopsGetErr) {
                  return done(categoryshopsGetErr);
                }

                // Get Categoryshops list
                var categoryshops = categoryshopsGetRes.body;

                // Set assertions
                (categoryshops[0].user._id).should.equal(userId);
                (categoryshops[0].name).should.match('Categoryshop name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Categoryshop if not logged in', function (done) {
    agent.post('/api/categoryshops')
      .send(categoryshop)
      .expect(403)
      .end(function (categoryshopSaveErr, categoryshopSaveRes) {
        // Call the assertion callback
        done(categoryshopSaveErr);
      });
  });

  it('should not be able to save an Categoryshop if no name is provided', function (done) {
    // Invalidate name field
    categoryshop.name = '';

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

        // Save a new Categoryshop
        agent.post('/api/categoryshops')
          .send(categoryshop)
          .expect(400)
          .end(function (categoryshopSaveErr, categoryshopSaveRes) {
            // Set message assertion
            (categoryshopSaveRes.body.message).should.match('Please fill Categoryshop name');

            // Handle Categoryshop save error
            done(categoryshopSaveErr);
          });
      });
  });

  it('should be able to update an Categoryshop if signed in', function (done) {
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

        // Save a new Categoryshop
        agent.post('/api/categoryshops')
          .send(categoryshop)
          .expect(200)
          .end(function (categoryshopSaveErr, categoryshopSaveRes) {
            // Handle Categoryshop save error
            if (categoryshopSaveErr) {
              return done(categoryshopSaveErr);
            }

            // Update Categoryshop name
            categoryshop.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Categoryshop
            agent.put('/api/categoryshops/' + categoryshopSaveRes.body._id)
              .send(categoryshop)
              .expect(200)
              .end(function (categoryshopUpdateErr, categoryshopUpdateRes) {
                // Handle Categoryshop update error
                if (categoryshopUpdateErr) {
                  return done(categoryshopUpdateErr);
                }

                // Set assertions
                (categoryshopUpdateRes.body._id).should.equal(categoryshopSaveRes.body._id);
                (categoryshopUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Categoryshops if not signed in', function (done) {
    // Create new Categoryshop model instance
    var categoryshopObj = new Categoryshop(categoryshop);

    // Save the categoryshop
    categoryshopObj.save(function () {
      // Request Categoryshops
      request(app).get('/api/categoryshops')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Categoryshop if not signed in', function (done) {
    // Create new Categoryshop model instance
    var categoryshopObj = new Categoryshop(categoryshop);

    // Save the Categoryshop
    categoryshopObj.save(function () {
      request(app).get('/api/categoryshops/' + categoryshopObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', categoryshop.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Categoryshop with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/categoryshops/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Categoryshop is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Categoryshop which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Categoryshop
    request(app).get('/api/categoryshops/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Categoryshop with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Categoryshop if signed in', function (done) {
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

        // Save a new Categoryshop
        agent.post('/api/categoryshops')
          .send(categoryshop)
          .expect(200)
          .end(function (categoryshopSaveErr, categoryshopSaveRes) {
            // Handle Categoryshop save error
            if (categoryshopSaveErr) {
              return done(categoryshopSaveErr);
            }

            // Delete an existing Categoryshop
            agent.delete('/api/categoryshops/' + categoryshopSaveRes.body._id)
              .send(categoryshop)
              .expect(200)
              .end(function (categoryshopDeleteErr, categoryshopDeleteRes) {
                // Handle categoryshop error error
                if (categoryshopDeleteErr) {
                  return done(categoryshopDeleteErr);
                }

                // Set assertions
                (categoryshopDeleteRes.body._id).should.equal(categoryshopSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Categoryshop if not signed in', function (done) {
    // Set Categoryshop user
    categoryshop.user = user;

    // Create new Categoryshop model instance
    var categoryshopObj = new Categoryshop(categoryshop);

    // Save the Categoryshop
    categoryshopObj.save(function () {
      // Try deleting Categoryshop
      request(app).delete('/api/categoryshops/' + categoryshopObj._id)
        .expect(403)
        .end(function (categoryshopDeleteErr, categoryshopDeleteRes) {
          // Set message assertion
          (categoryshopDeleteRes.body.message).should.match('User is not authorized');

          // Handle Categoryshop error error
          done(categoryshopDeleteErr);
        });

    });
  });

  it('should be able to get a single Categoryshop that has an orphaned user reference', function (done) {
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
      provider: 'local',
      roles: ['admin']
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

          // Save a new Categoryshop
          agent.post('/api/categoryshops')
            .send(categoryshop)
            .expect(200)
            .end(function (categoryshopSaveErr, categoryshopSaveRes) {
              // Handle Categoryshop save error
              if (categoryshopSaveErr) {
                return done(categoryshopSaveErr);
              }

              // Set assertions on new Categoryshop
              (categoryshopSaveRes.body.name).should.equal(categoryshop.name);
              should.exist(categoryshopSaveRes.body.user);
              should.equal(categoryshopSaveRes.body.user._id, orphanId);

              // force the Categoryshop to have an orphaned user reference
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

                    // Get the Categoryshop
                    agent.get('/api/categoryshops/' + categoryshopSaveRes.body._id)
                      .expect(200)
                      .end(function (categoryshopInfoErr, categoryshopInfoRes) {
                        // Handle Categoryshop error
                        if (categoryshopInfoErr) {
                          return done(categoryshopInfoErr);
                        }

                        // Set assertions
                        (categoryshopInfoRes.body._id).should.equal(categoryshopSaveRes.body._id);
                        (categoryshopInfoRes.body.name).should.equal(categoryshop.name);
                        should.equal(categoryshopInfoRes.body.user, undefined);

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
      Categoryshop.remove().exec(done);
    });
  });
});
