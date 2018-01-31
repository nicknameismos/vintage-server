'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Bid = mongoose.model('Bid'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  bid;

/**
 * Bid routes tests
 */
describe('Bid CRUD tests', function () {

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

    // Save a user to the test db and create new Bid
    user.save(function () {
      bid = {
        name: 'Bid name',
        detail: 'bid detail',
        startprice: 50,
        bidprice: 100,
        starttime: new Date(),
        endtime: new Date(),
        image: 'image',
        user: user
      };

      done();
    });
  });

  it('should be able to save a Bid if logged in', function (done) {
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

        // Save a new Bid
        agent.post('/api/bids')
          .send(bid)
          .expect(200)
          .end(function (bidSaveErr, bidSaveRes) {
            // Handle Bid save error
            if (bidSaveErr) {
              return done(bidSaveErr);
            }

            // Get a list of Bids
            agent.get('/api/bids')
              .end(function (bidsGetErr, bidsGetRes) {
                // Handle Bids save error
                if (bidsGetErr) {
                  return done(bidsGetErr);
                }

                // Get Bids list
                var bids = bidsGetRes.body;

                // Set assertions
                (bids[0].user._id).should.equal(userId);
                (bids[0].name).should.match('Bid name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Bid if not logged in', function (done) {
    agent.post('/api/bids')
      .send(bid)
      .expect(403)
      .end(function (bidSaveErr, bidSaveRes) {
        // Call the assertion callback
        done(bidSaveErr);
      });
  });

  it('should not be able to save an Bid if no name is provided', function (done) {
    // Invalidate name field
    bid.name = '';

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

        // Save a new Bid
        agent.post('/api/bids')
          .send(bid)
          .expect(400)
          .end(function (bidSaveErr, bidSaveRes) {
            // Set message assertion
            (bidSaveRes.body.message).should.match('Please fill Bid name');

            // Handle Bid save error
            done(bidSaveErr);
          });
      });
  });

  it('should not be able to save an Bid if no image is provided', function (done) {
    // Invalidate name field
    bid.image = '';

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

        // Save a new Bid
        agent.post('/api/bids')
          .send(bid)
          .expect(400)
          .end(function (bidSaveErr, bidSaveRes) {
            // Set message assertion
            (bidSaveRes.body.message).should.match('Please fill Bid image');

            // Handle Bid save error
            done(bidSaveErr);
          });
      });
  });

  it('should not be able to save an Bid if no bidprice is provided', function (done) {
    // Invalidate name field
    bid.bidprice = null;

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

        // Save a new Bid
        agent.post('/api/bids')
          .send(bid)
          .expect(400)
          .end(function (bidSaveErr, bidSaveRes) {
            // Set message assertion
            (bidSaveRes.body.message).should.match('Please fill Bid bidprice');

            // Handle Bid save error
            done(bidSaveErr);
          });
      });
  });

  it('should be able to update an Bid if signed in', function (done) {
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

        // Save a new Bid
        agent.post('/api/bids')
          .send(bid)
          .expect(200)
          .end(function (bidSaveErr, bidSaveRes) {
            // Handle Bid save error
            if (bidSaveErr) {
              return done(bidSaveErr);
            }

            // Update Bid name
            bid.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Bid
            agent.put('/api/bids/' + bidSaveRes.body._id)
              .send(bid)
              .expect(200)
              .end(function (bidUpdateErr, bidUpdateRes) {
                // Handle Bid update error
                if (bidUpdateErr) {
                  return done(bidUpdateErr);
                }

                // Set assertions
                (bidUpdateRes.body._id).should.equal(bidSaveRes.body._id);
                (bidUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Bids if not signed in', function (done) {
    // Create new Bid model instance
    var bidObj = new Bid(bid);

    // Save the bid
    bidObj.save(function () {
      // Request Bids
      request(app).get('/api/bids')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Bid if not signed in', function (done) {
    // Create new Bid model instance
    var bidObj = new Bid(bid);

    // Save the Bid
    bidObj.save(function () {
      request(app).get('/api/bids/' + bidObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', bid.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Bid with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/bids/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Bid is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Bid which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Bid
    request(app).get('/api/bids/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Bid with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Bid if signed in', function (done) {
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

        // Save a new Bid
        agent.post('/api/bids')
          .send(bid)
          .expect(200)
          .end(function (bidSaveErr, bidSaveRes) {
            // Handle Bid save error
            if (bidSaveErr) {
              return done(bidSaveErr);
            }

            // Delete an existing Bid
            agent.delete('/api/bids/' + bidSaveRes.body._id)
              .send(bid)
              .expect(200)
              .end(function (bidDeleteErr, bidDeleteRes) {
                // Handle bid error error
                if (bidDeleteErr) {
                  return done(bidDeleteErr);
                }

                // Set assertions
                (bidDeleteRes.body._id).should.equal(bidSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Bid if not signed in', function (done) {
    // Set Bid user
    bid.user = user;

    // Create new Bid model instance
    var bidObj = new Bid(bid);

    // Save the Bid
    bidObj.save(function () {
      // Try deleting Bid
      request(app).delete('/api/bids/' + bidObj._id)
        .expect(403)
        .end(function (bidDeleteErr, bidDeleteRes) {
          // Set message assertion
          (bidDeleteRes.body.message).should.match('User is not authorized');

          // Handle Bid error error
          done(bidDeleteErr);
        });

    });
  });

  it('should be able to get a single Bid that has an orphaned user reference', function (done) {
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

          // Save a new Bid
          agent.post('/api/bids')
            .send(bid)
            .expect(200)
            .end(function (bidSaveErr, bidSaveRes) {
              // Handle Bid save error
              if (bidSaveErr) {
                return done(bidSaveErr);
              }

              // Set assertions on new Bid
              (bidSaveRes.body.name).should.equal(bid.name);
              should.exist(bidSaveRes.body.user);
              should.equal(bidSaveRes.body.user._id, orphanId);

              // force the Bid to have an orphaned user reference
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

                    // Get the Bid
                    agent.get('/api/bids/' + bidSaveRes.body._id)
                      .expect(200)
                      .end(function (bidInfoErr, bidInfoRes) {
                        // Handle Bid error
                        if (bidInfoErr) {
                          return done(bidInfoErr);
                        }

                        // Set assertions
                        (bidInfoRes.body._id).should.equal(bidSaveRes.body._id);
                        (bidInfoRes.body.name).should.equal(bid.name);
                        should.equal(bidInfoRes.body.user, undefined);

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
      Bid.remove().exec(done);
    });
  });
});
