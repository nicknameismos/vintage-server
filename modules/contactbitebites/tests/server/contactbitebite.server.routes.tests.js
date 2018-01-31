'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Contactbitebite = mongoose.model('Contactbitebite'),
  Contactchoice = mongoose.model('Contactchoice'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  contactchoice,
  contactbitebite;

/**
 * Contactbitebite routes tests
 */
describe('Contactbitebite CRUD tests', function () {

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

    contactchoice = new Contactchoice({
      name: 'แนะนำบริการ'
    });

    // Save a user to the test db and create new Contactbitebite
    user.save(function () {
      contactchoice.save(function () {
        contactbitebite = {
          title: contactchoice,
          description: 'สอบถามการสมัคร',
          image: 'http://www.capitaladvance.co.th/image/mypic_customize/button-submit.jpg',
          user: user
        };

        done();
      });

    });
  });

  it('should be able to save a Contactbitebite if logged in', function (done) {
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

        // Save a new Contactbitebite
        agent.post('/api/contactbitebites')
          .send(contactbitebite)
          .expect(200)
          .end(function (contactbitebiteSaveErr, contactbitebiteSaveRes) {
            // Handle Contactbitebite save error
            if (contactbitebiteSaveErr) {
              return done(contactbitebiteSaveErr);
            }

            // Get a list of Contactbitebites
            agent.get('/api/contactbitebites')
              .end(function (contactbitebitesGetErr, contactbitebitesGetRes) {
                // Handle Contactbitebites save error
                if (contactbitebitesGetErr) {
                  return done(contactbitebitesGetErr);
                }

                // Get Contactbitebites list
                var contactbitebites = contactbitebitesGetRes.body;

                // Set assertions
                (contactbitebites[0].user._id).should.equal(userId);
                (contactbitebites[0].title.name).should.match(contactchoice.name);
                (contactbitebites[0].description).should.match('สอบถามการสมัคร');
                (contactbitebites[0].image).should.match('http://www.capitaladvance.co.th/image/mypic_customize/button-submit.jpg');


                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Contactbitebite if not logged in', function (done) {
    agent.post('/api/contactbitebites')
      .send(contactbitebite)
      .expect(403)
      .end(function (contactbitebiteSaveErr, contactbitebiteSaveRes) {
        // Call the assertion callback
        done(contactbitebiteSaveErr);
      });
  });

  it('should be able to update an Contactbitebite if signed in', function (done) {
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

        // Save a new Contactbitebite
        agent.post('/api/contactbitebites')
          .send(contactbitebite)
          .expect(200)
          .end(function (contactbitebiteSaveErr, contactbitebiteSaveRes) {
            // Handle Contactbitebite save error
            if (contactbitebiteSaveErr) {
              return done(contactbitebiteSaveErr);
            }

            // Update Contactbitebite name
            var newtitle = new Contactchoice({
              name: 'test'
            });
            contactbitebite.title = newtitle;

            // Update an existing Contactbitebite
            agent.put('/api/contactbitebites/' + contactbitebiteSaveRes.body._id)
              .send(contactbitebite)
              .expect(200)
              .end(function (contactbitebiteUpdateErr, contactbitebiteUpdateRes) {
                // Handle Contactbitebite update error
                if (contactbitebiteUpdateErr) {
                  return done(contactbitebiteUpdateErr);
                }

                // Set assertions
                (contactbitebiteUpdateRes.body._id).should.equal(contactbitebiteSaveRes.body._id);
                (contactbitebiteUpdateRes.body.title.name).should.match(newtitle.name);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Contactbitebites if not signed in', function (done) {
    // Create new Contactbitebite model instance
    var contactbitebiteObj = new Contactbitebite(contactbitebite);

    // Save the contactbitebite
    contactbitebiteObj.save(function () {
      // Request Contactbitebites
      request(app).get('/api/contactbitebites')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Contactbitebite if not signed in', function (done) {
    // Create new Contactbitebite model instance
    var contactbitebiteObj = new Contactbitebite(contactbitebite);

    // Save the Contactbitebite
    contactbitebiteObj.save(function () {
      request(app).get('/api/contactbitebites/' + contactbitebiteObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('description', contactbitebite.description);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Contactbitebite with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/contactbitebites/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Contactbitebite is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Contactbitebite which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Contactbitebite
    request(app).get('/api/contactbitebites/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Contactbitebite with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Contactbitebite if signed in', function (done) {
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

        // Save a new Contactbitebite
        agent.post('/api/contactbitebites')
          .send(contactbitebite)
          .expect(200)
          .end(function (contactbitebiteSaveErr, contactbitebiteSaveRes) {
            // Handle Contactbitebite save error
            if (contactbitebiteSaveErr) {
              return done(contactbitebiteSaveErr);
            }

            // Delete an existing Contactbitebite
            agent.delete('/api/contactbitebites/' + contactbitebiteSaveRes.body._id)
              .send(contactbitebite)
              .expect(200)
              .end(function (contactbitebiteDeleteErr, contactbitebiteDeleteRes) {
                // Handle contactbitebite error error
                if (contactbitebiteDeleteErr) {
                  return done(contactbitebiteDeleteErr);
                }

                // Set assertions
                (contactbitebiteDeleteRes.body._id).should.equal(contactbitebiteSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Contactbitebite if not signed in', function (done) {
    // Set Contactbitebite user
    contactbitebite.user = user;

    // Create new Contactbitebite model instance
    var contactbitebiteObj = new Contactbitebite(contactbitebite);

    // Save the Contactbitebite
    contactbitebiteObj.save(function () {
      // Try deleting Contactbitebite
      request(app).delete('/api/contactbitebites/' + contactbitebiteObj._id)
        .expect(403)
        .end(function (contactbitebiteDeleteErr, contactbitebiteDeleteRes) {
          // Set message assertion
          (contactbitebiteDeleteRes.body.message).should.match('User is not authorized');

          // Handle Contactbitebite error error
          done(contactbitebiteDeleteErr);
        });

    });
  });

  it('should be able to get a single Contactbitebite that has an orphaned user reference', function (done) {
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

          // Save a new Contactbitebite
          agent.post('/api/contactbitebites')
            .send(contactbitebite)
            .expect(200)
            .end(function (contactbitebiteSaveErr, contactbitebiteSaveRes) {
              // Handle Contactbitebite save error
              if (contactbitebiteSaveErr) {
                return done(contactbitebiteSaveErr);
              }

              // Set assertions on new Contactbitebite
              (contactbitebiteSaveRes.body.title).should.equal(contactchoice.id);
              should.exist(contactbitebiteSaveRes.body.user);
              should.equal(contactbitebiteSaveRes.body.user._id, orphanId);

              // force the Contactbitebite to have an orphaned user reference
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

                    // Get the Contactbitebite
                    agent.get('/api/contactbitebites/' + contactbitebiteSaveRes.body._id)
                      .expect(200)
                      .end(function (contactbitebiteInfoErr, contactbitebiteInfoRes) {
                        // Handle Contactbitebite error
                        if (contactbitebiteInfoErr) {
                          return done(contactbitebiteInfoErr);
                        }

                        // Set assertions
                        (contactbitebiteInfoRes.body._id).should.equal(contactbitebiteSaveRes.body._id);
                        (contactbitebiteInfoRes.body.title.name).should.equal(contactbitebite.title.name);
                        should.equal(contactbitebiteInfoRes.body.user, undefined);

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
      Contactchoice.remove().exec(function () {
        Contactbitebite.remove().exec(done);

      });
    });
  });
});
