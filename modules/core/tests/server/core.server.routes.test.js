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
var app, agent, credentials, user, _user, admin, token;

/**
 * User routes tests
 */
describe('Authen Token tests', function () {

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
        _user = {
            firstName: 'Full',
            lastName: 'Name',
            displayName: 'Full Name',
            email: 'test@test.com',
            username: credentials.username,
            password: credentials.password,
            provider: 'local',
            roles: ['admin']
        };

        user = new User(_user);

        // Save a user to the test db and create new article
        user.save(function (err) {
            should.not.exist(err);
            done();
        });
    });


    it('should be able to login successfully and have token for get protected', function (done) {

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
                agent.get('/api/protected')
                    .set('authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(function (signinErr, signinResToken) {
                        // Handle signin error
                        if (signinErr) {
                            return done(signinErr);
                        }
                        signinResToken.body.firstName.should.equal(_user.firstName);
                        done();
                    });
            });

    });

    it('should be able to login successfully and have token for post categoryshops', function (done) {
        var categoryshop = {
            name: 'Categoryshop name'
        };
        agent.post('/api/categoryshops')
            .set('authorization', 'Bearer ' + token)
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
                        (categoryshops[0].name).should.match('Categoryshop name');

                        // Call the assertion callback
                        done();
                    });
            });

    });


    afterEach(function (done) {
        User.remove().exec(function () {
            Categoryshop.remove().exec(done);
        });
    });
});
