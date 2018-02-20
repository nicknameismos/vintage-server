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
      provider: 'local',
      profileImageURL: 'profileImageURL'
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
    var bidObj3 = new Bid(bid);
    var bidObj4 = new Bid(bid);
    var today = new Date();

    bidObj3.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
    bidObj3.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8);
    bidObj3.userbid = [{
      user: user,
      bidprice: 160,
      created: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10)
    }];
    var selectedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    selectedTime.setHours(0, 0, 0);
    bidObj4.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
    bidObj4.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8);
    bidObj4.userbid = [{
      user: user,
      bidprice: 160,
      created: selectedTime
    }];

    bidObj.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    bidObj.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    bidObj.endtime = bidObj.endtime.setHours(23);
    bidObj.userbid = [{
      user: user,
      bidprice: 160
    }];

    bidObj1.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    bidObj1.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

    bidObj2.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    bidObj2.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

    bidObj.save();
    bidObj1.save();
    bidObj2.save();
    bidObj3.save();
    bidObj4.save();

    agent.get('/api/getbidlist/' + user.id)
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
        (bids.items[0].type).should.match('NOW');
        (bids.items[0].items.length).should.match(3);
        (bids.items[1].type).should.match('COMING_SOON');
        (bids.items[1].items.length).should.match(0);
        (bids.items[2].type).should.match('ME');
        (bids.items[2].items.length).should.match(2);

        done();
      });
  });

  it('get biddetail', function (done) {
    var bidObj = new Bid(bid);

    var today = new Date();

    bidObj.starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    bidObj.endtime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    bidObj.userbid = [{
      user: user,
      bidprice: 400
    }];

    bidObj.save();

    agent.get('/api/biddetail/' + bidObj.id)
      .set('authorization', 'Bearer ' + token)
      .end(function (bidsGetErr, bidsGetRes) {
        // Handle bids save error
        if (bidsGetErr) {
          return done(bidsGetErr);
        }

        // Get bids list
        var bids = bidsGetRes.body;

        // Set assertions
        (bids._id).should.match(bidObj.id);
        (bids.product.name).should.match(bidObj.name);
        (bids.product.images).should.match(bid.image);
        (bids.product.detail).should.match(bidObj.detail);
        // (bids.datestart).should.match(bidObj.starttime);
        // (bids.dateend).should.match(bidObj.endtime);
        (bids.price).should.match(400);
        (bids.pricestart).should.match(bidObj.startprice);
        (bids.pricebid).should.match(bidObj.bidprice);
        (bids.isBid).should.match(false);
        (bids.currentuser._id).should.match(user.id);
        (bids.currentuser.name).should.match(user.displayName);
        (bids.currentuser.profileImageURL).should.match(user.profileImageURL);
        (bids.datenow).should.match(new Date());
        done();
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Bid.remove().exec(done);
    });
  });
});
