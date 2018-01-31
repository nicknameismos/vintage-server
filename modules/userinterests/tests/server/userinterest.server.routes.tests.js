'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Userinterest = mongoose.model('Userinterest'),
  Promotioninterest = mongoose.model('Promotioninterest'),
  Shopinterest = mongoose.model('Shopinterest'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  shopinterest,
  promotioninterest,
  userinterest;

/**
 * Userinterest routes tests
 */
describe('Userinterest CRUD tests', function () {

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

    shopinterest = new Shopinterest({
      shopinterest: 'Shopinterest name'
    });

    promotioninterest = new Promotioninterest({
      promotioninterest: 'Promotioninterest name'
    });

    // Save a user to the test db and create new Userinterest
    user.save(function () {
      shopinterest.save(function () {
        promotioninterest.save(function () {
          userinterest = {
            shopinterest: [shopinterest],
            promotioninterest: [promotioninterest],
            user: user
          };

          done();
        });
      });
    });
  });

  it('should be able to save a Userinterest if logged in', function (done) {
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

        // Save a new Userinterest
        agent.post('/api/userinterests')
          .send(userinterest)
          .expect(200)
          .end(function (userinterestSaveErr, userinterestSaveRes) {
            // Handle Userinterest save error
            if (userinterestSaveErr) {
              return done(userinterestSaveErr);
            }

            // Get a list of Userinterests
            agent.get('/api/userinterests')
              .end(function (userinterestsGetErr, userinterestsGetRes) {
                // Handle Userinterests save error
                if (userinterestsGetErr) {
                  return done(userinterestsGetErr);
                }

                // Get Userinterests list
                var userinterests = userinterestsGetRes.body;

                // Set assertions
                (userinterests[0].user._id).should.equal(userId);
                (userinterests[0].shopinterest[0].shopinterest).should.match(shopinterest.shopinterest);
                (userinterests[0].promotioninterest[0].promotioninterest).should.match(promotioninterest.promotioninterest);


                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Userinterest if not logged in', function (done) {
    agent.post('/api/userinterests')
      .send(userinterest)
      .expect(403)
      .end(function (userinterestSaveErr, userinterestSaveRes) {
        // Call the assertion callback
        done(userinterestSaveErr);
      });
  });

  it('should be able to update an Userinterest if signed in', function (done) {
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

        // Save a new Userinterest
        agent.post('/api/userinterests')
          .send(userinterest)
          .expect(200)
          .end(function (userinterestSaveErr, userinterestSaveRes) {
            // Handle Userinterest save error
            if (userinterestSaveErr) {
              return done(userinterestSaveErr);
            }

            // Update Userinterest name
            var shopinterest2 = new Shopinterest({
              shopinterest: '55555555555'
            });

            var promotioninterest2 = new Promotioninterest({
              promotioninterest: '666666666666'
            });
            userinterest.shopinterest = [shopinterest2];
            userinterest.promotioninterest = [promotioninterest2];

            // Update an existing Userinterest
            agent.put('/api/userinterests/' + userinterestSaveRes.body._id)
              .send(userinterest)
              .expect(200)
              .end(function (userinterestUpdateErr, userinterestUpdateRes) {
                // Handle Userinterest update error
                if (userinterestUpdateErr) {
                  return done(userinterestUpdateErr);
                }

                // Set assertions
                (userinterestUpdateRes.body._id).should.equal(userinterestSaveRes.body._id);
                (userinterestUpdateRes.body.shopinterest[0].shopinterest).should.match(shopinterest2.shopinterest);
                (userinterestUpdateRes.body.promotioninterest[0].promotioninterest).should.match(promotioninterest2.promotioninterest);


                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Userinterests if not signed in', function (done) {
    // Create new Userinterest model instance
    var userinterestObj = new Userinterest(userinterest);

    // Save the userinterest
    userinterestObj.save(function () {
      // Request Userinterests
      request(app).get('/api/userinterests')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  // it('should be able to get a single Userinterest if not signed in', function (done) {
  //   // Create new Userinterest model instance
  //   var userinterestObj = new Userinterest(userinterest);

  //   // Save the Userinterest
  //   userinterestObj.save(function () {
  //     request(app).get('/api/userinterests/' + userinterestObj._id)
  //       .end(function (req, res) {
  //         // Set assertion
  //         res.body.should.be.instanceof(Object).and.have.property('promotioninterest', userinterest.promotioninterest);

  //         // Call the assertion callback
  //         done();
  //       });
  //   });
  // });

  it('should return proper error for single Userinterest with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/userinterests/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Userinterest is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Userinterest which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Userinterest
    request(app).get('/api/userinterests/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Userinterest with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Userinterest if signed in', function (done) {
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

        // Save a new Userinterest
        agent.post('/api/userinterests')
          .send(userinterest)
          .expect(200)
          .end(function (userinterestSaveErr, userinterestSaveRes) {
            // Handle Userinterest save error
            if (userinterestSaveErr) {
              return done(userinterestSaveErr);
            }

            // Delete an existing Userinterest
            agent.delete('/api/userinterests/' + userinterestSaveRes.body._id)
              .send(userinterest)
              .expect(200)
              .end(function (userinterestDeleteErr, userinterestDeleteRes) {
                // Handle userinterest error error
                if (userinterestDeleteErr) {
                  return done(userinterestDeleteErr);
                }

                // Set assertions
                (userinterestDeleteRes.body._id).should.equal(userinterestSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Userinterest if not signed in', function (done) {
    // Set Userinterest user
    userinterest.user = user;

    // Create new Userinterest model instance
    var userinterestObj = new Userinterest(userinterest);

    // Save the Userinterest
    userinterestObj.save(function () {
      // Try deleting Userinterest
      request(app).delete('/api/userinterests/' + userinterestObj._id)
        .expect(403)
        .end(function (userinterestDeleteErr, userinterestDeleteRes) {
          // Set message assertion
          (userinterestDeleteRes.body.message).should.match('User is not authorized');

          // Handle Userinterest error error
          done(userinterestDeleteErr);
        });

    });
  });

  it('should be able to get a single Userinterest that has an orphaned user reference', function (done) {
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

          // Save a new Userinterest
          agent.post('/api/userinterests')
            .send(userinterest)
            .expect(200)
            .end(function (userinterestSaveErr, userinterestSaveRes) {
              // Handle Userinterest save error
              if (userinterestSaveErr) {
                return done(userinterestSaveErr);
              }

              // Set assertions on new Userinterest
              (userinterestSaveRes.body.promotioninterest[0]).should.equal(promotioninterest.id);
              should.exist(userinterestSaveRes.body.user);
              should.equal(userinterestSaveRes.body.user._id, orphanId);

              // force the Userinterest to have an orphaned user reference
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

                    // Get the Userinterest
                    agent.get('/api/userinterests/' + userinterestSaveRes.body._id)
                      .expect(200)
                      .end(function (userinterestInfoErr, userinterestInfoRes) {
                        // Handle Userinterest error
                        if (userinterestInfoErr) {
                          return done(userinterestInfoErr);
                        }

                        // Set assertions
                        (userinterestInfoRes.body._id).should.equal(userinterestSaveRes.body._id);
                        (userinterestInfoRes.body.promotioninterest[0].promotioninterest).should.equal(promotioninterest.promotioninterest);
                        should.equal(userinterestInfoRes.body.user, undefined);

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
      Shopinterest.remove().exec(function () {
        Promotioninterest.remove().exec(function () {
          Userinterest.remove().exec(done);
        });
      });
    });
  });
});
