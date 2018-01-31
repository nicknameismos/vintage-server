'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Review = mongoose.model('Review'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  review;

/**
 * Review routes tests
 */
describe('Review CRUD tests token', function () {

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

    // Save a user to the test db and create new Review
    user.save(function () {
      review = {
        title: 'Review title',
        description: 'Review description',
        image: 'Review image',
        likes: [user],
        active: true,
        iscoin: false,
        user: user
      };

      done();
    });
  });

  it('should be able to save a Review if logged in', function (done) {
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

        // Save a new Review
        agent.post('/api/reviews')
          .send(review)
          .expect(200)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Handle Review save error
            if (reviewSaveErr) {
              return done(reviewSaveErr);
            }

            // Get a list of Reviews
            agent.get('/api/reviews')
              .end(function (reviewsGetErr, reviewsGetRes) {
                // Handle Reviews save error
                if (reviewsGetErr) {
                  return done(reviewsGetErr);
                }

                // Get Reviews list
                var reviews = reviewsGetRes.body;

                // Set assertions
                (reviews[0].user._id).should.equal(userId);
                (reviews[0].title).should.match(review.title);
                (reviews[0].description).should.match(review.description);
                (reviews[0].image).should.match(review.image);
                (reviews[0].active).should.match(true);
                (reviews[0].iscoin).should.match(false);
                (reviews[0].likes.length).should.match(1);


                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Review if not logged in', function (done) {
    agent.post('/api/reviews')
      .send(review)
      .expect(403)
      .end(function (reviewSaveErr, reviewSaveRes) {
        // Call the assertion callback
        done(reviewSaveErr);
      });
  });

  it('should not be able to save an Review if no title is provided', function (done) {
    // Invalidate name field
    review.title = '';

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

        // Save a new Review
        agent.post('/api/reviews')
          .send(review)
          .expect(400)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Set message assertion
            (reviewSaveRes.body.message).should.match('Please fill Review title');

            // Handle Review save error
            done(reviewSaveErr);
          });
      });
  });

  it('should not be able to save an Review if no image is provided', function (done) {
    // Invalidate name field
    review.image = '';

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

        // Save a new Review
        agent.post('/api/reviews')
          .send(review)
          .expect(400)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Set message assertion
            (reviewSaveRes.body.message).should.match('Please fill Review image');

            // Handle Review save error
            done(reviewSaveErr);
          });
      });
  });

  it('should be able to update an Review if signed in', function (done) {
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

        // Save a new Review
        agent.post('/api/reviews')
          .send(review)
          .expect(200)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Handle Review save error
            if (reviewSaveErr) {
              return done(reviewSaveErr);
            }

            // Update Review title
            review.title = 'WHY YOU GOTTA BE SO MEAN?';
            // Update an existing Review
            agent.put('/api/reviews/' + reviewSaveRes.body._id)
              .send(review)
              .expect(200)
              .end(function (reviewUpdateErr, reviewUpdateRes) {
                // Handle Review update error
                if (reviewUpdateErr) {
                  return done(reviewUpdateErr);
                }

                // Set assertions
                (reviewUpdateRes.body._id).should.equal(reviewSaveRes.body._id);
                (reviewUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Reviews if not signed in', function (done) {
    // Create new Review model instance
    var reviewObj = new Review(review);

    // Save the review
    reviewObj.save(function () {
      // Request Reviews
      request(app).get('/api/reviews')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to delete an Review if signed in', function (done) {
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

        // Save a new Review
        agent.post('/api/reviews')
          .send(review)
          .expect(200)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Handle Review save error
            if (reviewSaveErr) {
              return done(reviewSaveErr);
            }

            // Delete an existing Review
            agent.delete('/api/reviews/' + reviewSaveRes.body._id)
              .send(review)
              .expect(200)
              .end(function (reviewDeleteErr, reviewDeleteRes) {
                // Handle review error error
                if (reviewDeleteErr) {
                  return done(reviewDeleteErr);
                }

                // Set assertions
                (reviewDeleteRes.body._id).should.equal(reviewSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('update likes', function (done) {
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
        review.likes = [];
        // Save a new Review
        agent.post('/api/reviews')
          .send(review)
          .expect(200)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Handle Review save error
            if (reviewSaveErr) {
              return done(reviewSaveErr);
            }
            // Update an existing Review
            agent.put('/api/islike/' + reviewSaveRes.body._id)
              // .send(review)
              .expect(200)
              .end(function (reviewUpdateErr, reviewUpdateRes) {
                // Handle Review update error
                if (reviewUpdateErr) {
                  return done(reviewUpdateErr);
                }
                var islike = reviewUpdateRes.body;
                (islike.title).should.match(review.title);
                (islike.description).should.match(review.description);
                (islike.image).should.match(review.image);
                (islike.islike).should.match(true);
                (islike.countlike).should.match(1);
                (islike.user.displayName).should.match(user.firstName + ' ' + user.lastName);
                (islike.user.profileImageURL).should.match('http://res.cloudinary.com/hflvlav04/image/upload/v1487834187/g3hwyieb7dl7ugdgj3tb.png');

                agent.get('/api/reviews/' + reviewSaveRes.body._id)
                  .end(function (reviewsGetErr, reviewsGetRes) {
                    // Handle Reviews save error
                    if (reviewsGetErr) {
                      return done(reviewsGetErr);
                    }

                    // Get Reviews list
                    var reviews = reviewsGetRes.body;

                    // Set assertions
                    (reviews.likes.length).should.match(1);

                    // Call the assertion callback
                    done();
                  });
              });
          });
      });
  });

  it('update un likes', function (done) {
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
        // review.likes = [];
        // Save a new Review
        agent.post('/api/reviews')
          .send(review)
          .expect(200)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Handle Review save error
            if (reviewSaveErr) {
              return done(reviewSaveErr);
            }

            // Update Review title
            // review.likes = {
            //   likes: user
            // };
            // Update an existing Review
            agent.put('/api/islike/' + reviewSaveRes.body._id)
              // .send(review)
              .expect(200)
              .end(function (reviewUpdateErr, reviewUpdateRes) {
                // Handle Review update error
                if (reviewUpdateErr) {
                  return done(reviewUpdateErr);
                }
                var islike = reviewUpdateRes.body;
                (islike.title).should.match(review.title);
                (islike.description).should.match(review.description);
                (islike.image).should.match(review.image);
                (islike.islike).should.match(false);
                (islike.countlike).should.match(0);
                (islike.user.displayName).should.match(user.firstName + ' ' + user.lastName);
                (islike.user.profileImageURL).should.match('http://res.cloudinary.com/hflvlav04/image/upload/v1487834187/g3hwyieb7dl7ugdgj3tb.png');

                agent.get('/api/reviews/' + reviewSaveRes.body._id)
                  .end(function (reviewsGetErr, reviewsGetRes) {
                    // Handle Reviews save error
                    if (reviewsGetErr) {
                      return done(reviewsGetErr);
                    }

                    // Get Reviews list
                    var reviews = reviewsGetRes.body;

                    // Set assertions
                    (reviews.likes.length).should.match(0);

                    // Call the assertion callback
                    done();
                  });
              });
          });
      });
  });

  it('getlistreview have me', function (done) {
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
        // Save a new Review
        agent.post('/api/reviews')
          .send(review)
          .expect(200)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Handle Review save error
            if (reviewSaveErr) {
              return done(reviewSaveErr);
            }

            agent.get('/api/getlistreview')
              .end(function (reviewsGetErr, reviewsGetRes) {
                // Handle Reviews save error
                if (reviewsGetErr) {
                  return done(reviewsGetErr);
                }

                // Get Reviews list
                var reviews = reviewsGetRes.body;

                // Set assertions
                // description: 'Review description',
                // image: 'Review image',
                // likes: [user],
                // active: true,
                // iscoin: false,
                // user: user
                (reviews.length).should.match(1);
                (reviews[0].title).should.match(review.title);
                (reviews[0].description).should.match(review.description);
                (reviews[0].image).should.match(review.image);
                (reviews[0].islike).should.match(true);
                (reviews[0].countlike).should.match(1);
                (reviews[0].user.displayName).should.match(user.firstName + ' ' + user.lastName);
                (reviews[0].user.profileImageURL).should.match('http://res.cloudinary.com/hflvlav04/image/upload/v1487834187/g3hwyieb7dl7ugdgj3tb.png');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('getlistreview not have me', function (done) {
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
        // Save a new Review
        review.likes = [];
        agent.post('/api/reviews')
          .send(review)
          .expect(200)
          .end(function (reviewSaveErr, reviewSaveRes) {
            // Handle Review save error
            if (reviewSaveErr) {
              return done(reviewSaveErr);
            }

            agent.get('/api/getlistreview')
              .end(function (reviewsGetErr, reviewsGetRes) {
                // Handle Reviews save error
                if (reviewsGetErr) {
                  return done(reviewsGetErr);
                }

                // Get Reviews list
                var reviews = reviewsGetRes.body;

                // Set assertions
                // description: 'Review description',
                // image: 'Review image',
                // likes: [user],
                // active: true,
                // iscoin: false,
                // user: user
                (reviews.length).should.match(1);
                (reviews[0].title).should.match(review.title);
                (reviews[0].description).should.match(review.description);
                (reviews[0].image).should.match(review.image);
                (reviews[0].islike).should.match(false);
                (reviews[0].countlike).should.match(0);
                (reviews[0].user.displayName).should.match(user.firstName + ' ' + user.lastName);
                (reviews[0].user.profileImageURL).should.match('http://res.cloudinary.com/hflvlav04/image/upload/v1487834187/g3hwyieb7dl7ugdgj3tb.png');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Review.remove().exec(done);
    });
  });
});
