'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Ad = mongoose.model('Ad'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  ad;

/**
 * Ad routes tests
 */
describe('Ad CRUD tests', function () {

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

    // Save a user to the test db and create new Ad
    user.save(function () {
      ad = {
        image: './assets/imgs/ads/ads1.png',
        isvideo: true,
        videoid: '###',
        status:true
      };

      done();
    });
  });

  it('should be able to save a Ad if logged in', function (done) {
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

        // Save a new Ad
        agent.post('/api/ads')
          .send(ad)
          .expect(200)
          .end(function (adSaveErr, adSaveRes) {
            // Handle Ad save error
            if (adSaveErr) {
              return done(adSaveErr);
            }

            // Get a list of Ads
            agent.get('/api/ads')
              .end(function (adsGetErr, adsGetRes) {
                // Handle Ads save error
                if (adsGetErr) {
                  return done(adsGetErr);
                }

                // Get Ads list
                var ads = adsGetRes.body;

                // Set assertions
                //ads.should.equal('');
                (ads[0].user._id).should.equal(userId);
                (ads[0].image).should.match('./assets/imgs/ads/ads1.png');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Ad if not logged in', function (done) {
    agent.post('/api/ads')
      .send(ad)
      .expect(403)
      .end(function (adSaveErr, adSaveRes) {
        // Call the assertion callback
        done(adSaveErr);
      });
  });

  // it('should not be able to save an Ad if no name is provided', function (done) {
  //   // Invalidate name field
  //   ad.image = '';

  //   agent.post('/api/auth/signin')
  //     .send(credentials)
  //     .expect(200)
  //     .end(function (signinErr, signinRes) {
  //       // Handle signin error
  //       if (signinErr) {
  //         return done(signinErr);
  //       }

  //       // Get the userId
  //       var userId = user.id;

  //       // Save a new Ad
  //       agent.post('/api/ads')
  //         .send(ad)
  //         .expect(400)
  //         .end(function (adSaveErr, adSaveRes) {
  //           // Set message assertion
  //           (adSaveRes.body.message).should.match('Please fill Ad image');

  //           // Handle Ad save error
  //           done(adSaveErr);
  //         });
  //     });
  // });

  it('should be able to update an Ad if signed in', function (done) {
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

        // Save a new Ad
        agent.post('/api/ads')
          .send(ad)
          .expect(200)
          .end(function (adSaveErr, adSaveRes) {
            // Handle Ad save error
            if (adSaveErr) {
              return done(adSaveErr);
            }

            // Update Ad name
            ad.image = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Ad
            agent.put('/api/ads/' + adSaveRes.body._id)
              .send(ad)
              .expect(200)
              .end(function (adUpdateErr, adUpdateRes) {
                // Handle Ad update error
                if (adUpdateErr) {
                  return done(adUpdateErr);
                }

                // Set assertions
                (adUpdateRes.body._id).should.equal(adSaveRes.body._id);
                (adUpdateRes.body.image).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Ads if not signed in', function (done) {
    // Create new Ad model instance
    var adObj = new Ad(ad);

    // Save the ad
    adObj.save(function () {
      // Request Ads
      request(app).get('/api/ads')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Ad if not signed in', function (done) {
    // Create new Ad model instance
    var adObj = new Ad(ad);

    // Save the Ad
    adObj.save(function () {
      request(app).get('/api/ads/' + adObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('image', ad.image);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Ad with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/ads/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Ad is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Ad which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Ad
    request(app).get('/api/ads/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Ad with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Ad if signed in', function (done) {
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

        // Save a new Ad
        agent.post('/api/ads')
          .send(ad)
          .expect(200)
          .end(function (adSaveErr, adSaveRes) {
            // Handle Ad save error
            if (adSaveErr) {
              return done(adSaveErr);
            }

            // Delete an existing Ad
            agent.delete('/api/ads/' + adSaveRes.body._id)
              .send(ad)
              .expect(200)
              .end(function (adDeleteErr, adDeleteRes) {
                // Handle ad error error
                if (adDeleteErr) {
                  return done(adDeleteErr);
                }

                // Set assertions
                (adDeleteRes.body._id).should.equal(adSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Ad if not signed in', function (done) {
    // Set Ad user
    ad.user = user;

    // Create new Ad model instance
    var adObj = new Ad(ad);

    // Save the Ad
    adObj.save(function () {
      // Try deleting Ad
      request(app).delete('/api/ads/' + adObj._id)
        .expect(403)
        .end(function (adDeleteErr, adDeleteRes) {
          // Set message assertion
          (adDeleteRes.body.message).should.match('User is not authorized');

          // Handle Ad error error
          done(adDeleteErr);
        });

    });
  });

  it('should be able to get a single Ad that has an orphaned user reference', function (done) {
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

          // Save a new Ad
          agent.post('/api/ads')
            .send(ad)
            .expect(200)
            .end(function (adSaveErr, adSaveRes) {
              // Handle Ad save error
              if (adSaveErr) {
                return done(adSaveErr);
              }

              // Set assertions on new Ad
              (adSaveRes.body.image).should.equal(ad.image);
              should.exist(adSaveRes.body.user);
              should.equal(adSaveRes.body.user._id, orphanId);

              // force the Ad to have an orphaned user reference
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

                    // Get the Ad
                    agent.get('/api/ads/' + adSaveRes.body._id)
                      .expect(200)
                      .end(function (adInfoErr, adInfoRes) {
                        // Handle Ad error
                        if (adInfoErr) {
                          return done(adInfoErr);
                        }

                        // Set assertions
                        (adInfoRes.body._id).should.equal(adSaveRes.body._id);
                        (adInfoRes.body.image).should.equal(ad.image);
                        should.equal(adInfoRes.body.user, undefined);

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
      Ad.remove().exec(done);
    });
  });
});
