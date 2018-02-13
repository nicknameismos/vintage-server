'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  pushNotification = mongoose.model('Notification'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  token,
  user,
  notification;

/**
 * pushNotification routes tests
 */
describe('pushNotification CRUD tests with token', function () {

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

    // Save a user to the test db and create new pushNotification
    user.save(function () {
      notification = {
        title: 'pushNotification Name',
        detail: 'detail',
        userowner: user
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

  it('should be have Token logged in with token', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('should be able to save a pushNotification if logged in', function (done) {

    // Save a new pushNotification
    agent.post('/api/notifications')
      .send(notification)
      .set('authorization', 'Bearer ' + token)
      .expect(200)
      .end(function (notificationSaveErr, notificationSaveRes) {
        // Handle pushNotification save error
        if (notificationSaveErr) {
          return done(notificationSaveErr);
        }

        // Get a list of pushNotifications
        agent.get('/api/notifications')
          .end(function (notificationsGetErr, notificationsGetRes) {
            // Handle pushNotifications save error
            if (notificationsGetErr) {
              return done(notificationsGetErr);
            }

            // Get pushNotifications list
            var notifications = notificationsGetRes.body;

            // Set assertions
            (notifications[0].user._id).should.equal(user.id);
            (notifications[0].title).should.match('pushNotification Name');
            (notifications[0].detail).should.match('detail');
            (notifications[0].userowner).should.match(user.id);
            (notifications[0].isread).should.match(false);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to update an pushNotification if signed in', function (done) {


    // Save a new pushNotification
    agent.post('/api/notifications')
      .set('authorization', 'Bearer ' + token)
      .send(notification)
      .expect(200)
      .end(function (notificationSaveErr, notificationSaveRes) {
        // Handle pushNotification save error
        if (notificationSaveErr) {
          return done(notificationSaveErr);
        }

        // Update pushNotification name
        notification.title = 'WHY YOU GOTTA BE SO MEAN?';

        // Update an existing pushNotification
        agent.put('/api/notifications/' + notificationSaveRes.body._id)
          .send(notification)
          .expect(200)
          .end(function (notificationUpdateErr, notificationUpdateRes) {
            // Handle pushNotification update error
            if (notificationUpdateErr) {
              return done(notificationUpdateErr);
            }

            // Set assertions
            (notificationUpdateRes.body._id).should.equal(notificationSaveRes.body._id);
            (notificationUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get a list of pushNotifications if not signed in', function (done) {
    // Create new pushNotification model instance
    var notificationObj = new pushNotification(notification);

    // Save the notification
    notificationObj.save(function () {
      // Request pushNotifications
      request(app).get('/api/notifications')
        .set('authorization', 'Bearer ' + token)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single pushNotification if not signed in', function (done) {
    // Create new pushNotification model instance
    var notificationObj = new pushNotification(notification);

    // Save the pushNotification
    notificationObj.save(function () {
      request(app).get('/api/notifications/' + notificationObj._id)
        .set('authorization', 'Bearer ' + token)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', notification.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single pushNotification with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/notifications/test')
      .set('authorization', 'Bearer ' + token)
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'pushNotification is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single pushNotification which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent pushNotification
    request(app).get('/api/notifications/559e9cd815f80b4c256a8f41')
      .set('authorization', 'Bearer ' + token)
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No pushNotification with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      pushNotification.remove().exec(done);
    });
  });
});
