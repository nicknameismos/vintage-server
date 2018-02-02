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
  token,
  bid;

/**
 * Bid routes tests
 */
describe('Bid CRUD tests with token', function () {

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
    token = '';
    // Save a user to the test db and create new Bid
    user.save(function () {
      bid = {
        name: 'Bid name',
        detail: 'bid detail',
        price: 300,
        startprice: 50,
        bidprice: 100,
        starttime: new Date(),
        endtime: new Date(),
        image: ['https://www.felex-lederwaren.de/bilder/produkte/gross/Billy-the-Kid-by-Greenburry-Rebel-of-Vintage-Greenburry-Damenumhaengetasche-UEberschlagtasche-rot-braun.jpg'],
        user: user
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

  it('get bid list', function (done) {
    var bidObj = new Bid(bid);
    var bidObj1 = new Bid(bid);
    var bidObj2 = new Bid(bid);

    var today = new Date();

    bidObj.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    bidObj.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    bidObj1.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    bidObj1.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

    bidObj2.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    bidObj2.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

    bidObj.save();
    bidObj1.save();
    bidObj2.save();

    agent.get('/api/getbidlist')
      .set('authorization', 'Bearer ' + token)
      .end(function (bidsGetErr, bidsGetRes) {
        // Handle bids save error
        if (bidsGetErr) {
          return done(bidsGetErr);
        }

        // Get bids list
        var bids = bidsGetRes.body;

        // Set assertions
        (bids.items.length).should.match(3);
        (bids.items[0].image).should.match(bid.image[0]);
        (bids.items[0].price).should.match(bid.price);
        (bids.items[0].isBid).should.match(true);
        (bids.items[0].pricestart).should.match(bid.startprice);
        (bids.items[0].pricebid).should.match(bid.bidprice);
        (bids.items[0].datestart).should.match(bid.starttime);
        (bids.items[0].dateend).should.match(bid.endtime);

        done();
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Bid.remove().exec(done);
    });
  });
});
