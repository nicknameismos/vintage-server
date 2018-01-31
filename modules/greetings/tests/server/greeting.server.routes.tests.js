'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Greeting = mongoose.model('Greeting'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  greeting;

/**
 * Greeting routes tests
 */
describe('Greeting CRUD tests', function () {

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

    // Save a user to the test db and create new Greeting
    user.save(function () {
      greeting = {
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg']
      };

      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          signinRes.body.loginToken.should.not.be.empty();
          token = signinRes.body.loginToken;
          done();
        });
    });
  });

  it('should be able to save a Greeting if logged in', function (done) {
    agent.post('/api/greetings')
      .set('authorization', 'Bearer ' + token)
      .send(greeting)
      .expect(200)
      .end(function (greetingSaveErr, greetingSaveRes) {
        // Handle Greeting save error
        if (greetingSaveErr) {
          return done(greetingSaveErr);
        }

        // Get a list of Greetings
        agent.get('/api/greetings')
          .end(function (greetingsGetErr, greetingsGetRes) {
            // Handle Greetings save error
            if (greetingsGetErr) {
              return done(greetingsGetErr);
            }

            // Get Greetings list
            var greetings = greetingsGetRes.body;
            (greetings[0].images[0]).should.match('image1.jpg');

            // Call the assertion callback
            done();
          });
      });
  });

  it('should not be able to save an Greeting if no images is provided', function (done) {
    // Invalidate name field
    greeting.images = '';

    // Save a new Greeting
    agent.post('/api/greetings')
      .set('authorization', 'Bearer ' + token)
      .send(greeting)
      .expect(400)
      .end(function (greetingSaveErr, greetingSaveRes) {
        // Set message assertion
        (greetingSaveRes.body.message).should.match('Please fill images');

        // Handle Greeting save error
        done(greetingSaveErr);
      });
  });

  it('should be able to update an Greeting if signed in', function (done) {
    // Save a new Greeting
    agent.post('/api/greetings')
      .set('authorization', 'Bearer ' + token)
      .send(greeting)
      .expect(200)
      .end(function (greetingSaveErr, greetingSaveRes) {
        // Handle Greeting save error
        if (greetingSaveErr) {
          return done(greetingSaveErr);
        }

        // Update Greeting name
        greeting.images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

        // Update an existing Greeting
        agent.put('/api/greetings/' + greetingSaveRes.body._id)
          .send(greeting)
          .expect(200)
          .end(function (greetingUpdateErr, greetingUpdateRes) {
            // Handle Greeting update error
            if (greetingUpdateErr) {
              return done(greetingUpdateErr);
            }

            // Set assertions
            (greetingUpdateRes.body._id).should.equal(greetingSaveRes.body._id);
            (greetingUpdateRes.body.images[0]).should.match('image1.jpg');

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get a list of Greetings if not signed in', function (done) {
    // Create new Greeting model instance
    var greetingObj = new Greeting(greeting);

    // Save the greeting
    greetingObj.save(function () {
      // Request Greetings
      request(app).get('/api/greetings')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  // it('should be able to get a single Greeting if not signed in', function (done) {
  //   // Create new Greeting model instance
  //   var greetingObj = new Greeting(greeting);

  //   // Save the Greeting
  //   greetingObj.save(function () {
  //     request(app).get('/api/greetings/' + greetingObj._id)
  //       .end(function (req, res) {
  //         // Set assertion
  //         res.body.should.be.instanceof(Object).and.have.property('name', greeting.name);

  //         // Call the assertion callback
  //         done();
  //       });
  //   });
  // });

  it('should return proper error for single Greeting with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/greetings/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Greeting is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Greeting which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Greeting
    request(app).get('/api/greetings/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Greeting with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Greeting if signed in', function (done) {
    // Save a new Greeting
    agent.post('/api/greetings')
      .set('authorization', 'Bearer ' + token)
      .send(greeting)
      .expect(200)
      .end(function (greetingSaveErr, greetingSaveRes) {
        // Handle Greeting save error
        if (greetingSaveErr) {
          return done(greetingSaveErr);
        }

        // Delete an existing Greeting
        agent.delete('/api/greetings/' + greetingSaveRes.body._id)
          .send(greeting)
          .expect(200)
          .end(function (greetingDeleteErr, greetingDeleteRes) {
            // Handle greeting error error
            if (greetingDeleteErr) {
              return done(greetingDeleteErr);
            }

            // Set assertions
            (greetingDeleteRes.body._id).should.equal(greetingSaveRes.body._id);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should not be able to delete an Greeting if not signed in', function (done) {
    // Set Greeting user
    greeting.user = user;

    // Create new Greeting model instance
    var greetingObj = new Greeting(greeting);

    // Save the Greeting
    greetingObj.save(function () {
      // Try deleting Greeting
      request(app).delete('/api/greetings/' + greetingObj._id)
        .expect(403)
        .end(function (greetingDeleteErr, greetingDeleteRes) {
          // Set message assertion
          (greetingDeleteRes.body.message).should.match('User is not authorized');

          // Handle Greeting error error
          done(greetingDeleteErr);
        });

    });
  });

  // it('should be able to get a single Greeting that has an orphaned user reference', function (done) {
  //   // Create orphan user creds
  //   var _creds = {
  //     username: 'orphan',
  //     password: 'M3@n.jsI$Aw3$0m3'
  //   };

  //   // Create orphan user
  //   var _orphan = new User({
  //     firstName: 'Full',
  //     lastName: 'Name',
  //     displayName: 'Full Name',
  //     email: 'orphan@test.com',
  //     username: _creds.username,
  //     password: _creds.password,
  //     provider: 'local'
  //   });

  //   _orphan.save(function (err, orphan) {
  //     // Handle save error
  //     if (err) {
  //       return done(err);
  //     }

  //     agent.post('/api/auth/signin')
  //       .send(_creds)
  //       .expect(200)
  //       .end(function (signinErr, signinRes) {
  //         // Handle signin error
  //         if (signinErr) {
  //           return done(signinErr);
  //         }

  //         // Get the userId
  //         var orphanId = orphan._id;

  //         // Save a new Greeting
  //         agent.post('/api/greetings')
  //           .send(greeting)
  //           .expect(200)
  //           .end(function (greetingSaveErr, greetingSaveRes) {
  //             // Handle Greeting save error
  //             if (greetingSaveErr) {
  //               return done(greetingSaveErr);
  //             }

  //             // Set assertions on new Greeting
  //             (greetingSaveRes.body.name).should.equal(greeting.name);
  //             should.exist(greetingSaveRes.body.user);
  //             should.equal(greetingSaveRes.body.user._id, orphanId);

  //             // force the Greeting to have an orphaned user reference
  //             orphan.remove(function () {
  //               // now signin with valid user
  //               agent.post('/api/auth/signin')
  //                 .send(credentials)
  //                 .expect(200)
  //                 .end(function (err, res) {
  //                   // Handle signin error
  //                   if (err) {
  //                     return done(err);
  //                   }

  //                   // Get the Greeting
  //                   agent.get('/api/greetings/' + greetingSaveRes.body._id)
  //                     .expect(200)
  //                     .end(function (greetingInfoErr, greetingInfoRes) {
  //                       // Handle Greeting error
  //                       if (greetingInfoErr) {
  //                         return done(greetingInfoErr);
  //                       }

  //                       // Set assertions
  //                       (greetingInfoRes.body._id).should.equal(greetingSaveRes.body._id);
  //                       (greetingInfoRes.body.name).should.equal(greeting.name);
  //                       should.equal(greetingInfoRes.body.user, undefined);

  //                       // Call the assertion callback
  //                       done();
  //                     });
  //                 });
  //             });
  //           });
  //       });
  //   });
  // });

  afterEach(function (done) {
    User.remove().exec(function () {
      Greeting.remove().exec(done);
    });
  });
});
