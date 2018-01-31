'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shop = mongoose.model('Shop'),
  Hotprice = mongoose.model('Hotprice'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  shop,
  hotprice;

/**
 * Hotprice routes tests
 */
describe('Hotprice CRUD tests', function () {

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

    shop = new Shop({
      name: 'Shop name',
      name_eng: 'Shop name english',
      detail: 'Shop Detail',
      tel: '0894447208',
      email: 'test@gmail.com',
      facebook: 'facebook.com',
      line: '@lineid',
      address: {
        address: '77/7',
        addressdetail: 'in font of 7-eleven',
        subdistinct: 'Lumlukka',
        distinct: 'Lumlukka',
        province: 'BKK',
        postcode: '12150',
        lat: '13.9338949',
        lng: '100.6827773'
      },
      times: [{
        description: 'all days',
        timestart: '08.00',
        timeend: '20.00',
        days: ['mon', 'thu', 'sun']
      }],
      coverimage: 'https://img.wongnai.com/p/l/2016/11/29/15ff08373d31409fb2f80ebf4623589a.jpg',
      promoteimage: ['http://ed.files-media.com/ud/images/1/22/63943/IMG_7799_Cover.jpg'],
      isactiveshop: false,
      importform: 'manual',
      user: user
    });
    // Save a user to the test db and create new Hotprice
    user.save(function () {
      shop.save(function(){
        hotprice = {
          name: 'Hotprice Name',
          image: './assets/imgs/hot_price/hotprice1.png',
          shop: shop,
          user: user
        };
  
        done();
      });
      
    });
  });

  it('should be able to save a Hotprice if logged in', function (done) {
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

        // Save a new Hotprice
        agent.post('/api/hotprices')
          .send(hotprice)
          .expect(200)
          .end(function (hotpriceSaveErr, hotpriceSaveRes) {
            // Handle Hotprice save error
            if (hotpriceSaveErr) {
              return done(hotpriceSaveErr);
            }

            // Get a list of Hotprices
            agent.get('/api/hotprices')
              .end(function (hotpricesGetErr, hotpricesGetRes) {
                // Handle Hotprices save error
                if (hotpricesGetErr) {
                  return done(hotpricesGetErr);
                }

                // Get Hotprices list
                var hotprices = hotpricesGetRes.body;

                // Set assertions
                (hotprices[0].user._id).should.equal(userId);
                (hotprices[0].name).should.match('Hotprice Name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Hotprice if not logged in', function (done) {
    agent.post('/api/hotprices')
      .send(hotprice)
      .expect(403)
      .end(function (hotpriceSaveErr, hotpriceSaveRes) {
        // Call the assertion callback
        done(hotpriceSaveErr);
      });
  });

  it('should not be able to save an Hotprice if no name is provided', function (done) {
    // Invalidate name field
    hotprice.name = '';

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

        // Save a new Hotprice
        agent.post('/api/hotprices')
          .send(hotprice)
          .expect(400)
          .end(function (hotpriceSaveErr, hotpriceSaveRes) {
            // Set message assertion
            (hotpriceSaveRes.body.message).should.match('Please fill Hotprice name');

            // Handle Hotprice save error
            done(hotpriceSaveErr);
          });
      });
  });

  it('should be able to update an Hotprice if signed in', function (done) {
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

        // Save a new Hotprice
        agent.post('/api/hotprices')
          .send(hotprice)
          .expect(200)
          .end(function (hotpriceSaveErr, hotpriceSaveRes) {
            // Handle Hotprice save error
            if (hotpriceSaveErr) {
              return done(hotpriceSaveErr);
            }

            // Update Hotprice name
            hotprice.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Hotprice
            agent.put('/api/hotprices/' + hotpriceSaveRes.body._id)
              .send(hotprice)
              .expect(200)
              .end(function (hotpriceUpdateErr, hotpriceUpdateRes) {
                // Handle Hotprice update error
                if (hotpriceUpdateErr) {
                  return done(hotpriceUpdateErr);
                }

                // Set assertions
                (hotpriceUpdateRes.body._id).should.equal(hotpriceSaveRes.body._id);
                (hotpriceUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Hotprices if not signed in', function (done) {
    // Create new Hotprice model instance
    var hotpriceObj = new Hotprice(hotprice);

    // Save the hotprice
    hotpriceObj.save(function () {
      // Request Hotprices
      request(app).get('/api/hotprices')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Hotprice if not signed in', function (done) {
    // Create new Hotprice model instance
    var hotpriceObj = new Hotprice(hotprice);

    // Save the Hotprice
    hotpriceObj.save(function () {
      request(app).get('/api/hotprices/' + hotpriceObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', hotprice.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Hotprice with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/hotprices/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Hotprice is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Hotprice which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Hotprice
    request(app).get('/api/hotprices/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Hotprice with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Hotprice if signed in', function (done) {
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

        // Save a new Hotprice
        agent.post('/api/hotprices')
          .send(hotprice)
          .expect(200)
          .end(function (hotpriceSaveErr, hotpriceSaveRes) {
            // Handle Hotprice save error
            if (hotpriceSaveErr) {
              return done(hotpriceSaveErr);
            }

            // Delete an existing Hotprice
            agent.delete('/api/hotprices/' + hotpriceSaveRes.body._id)
              .send(hotprice)
              .expect(200)
              .end(function (hotpriceDeleteErr, hotpriceDeleteRes) {
                // Handle hotprice error error
                if (hotpriceDeleteErr) {
                  return done(hotpriceDeleteErr);
                }

                // Set assertions
                (hotpriceDeleteRes.body._id).should.equal(hotpriceSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Hotprice if not signed in', function (done) {
    // Set Hotprice user
    hotprice.user = user;

    // Create new Hotprice model instance
    var hotpriceObj = new Hotprice(hotprice);

    // Save the Hotprice
    hotpriceObj.save(function () {
      // Try deleting Hotprice
      request(app).delete('/api/hotprices/' + hotpriceObj._id)
        .expect(403)
        .end(function (hotpriceDeleteErr, hotpriceDeleteRes) {
          // Set message assertion
          (hotpriceDeleteRes.body.message).should.match('User is not authorized');

          // Handle Hotprice error error
          done(hotpriceDeleteErr);
        });

    });
  });

  it('should be able to get a single Hotprice that has an orphaned user reference', function (done) {
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

          // Save a new Hotprice
          agent.post('/api/hotprices')
            .send(hotprice)
            .expect(200)
            .end(function (hotpriceSaveErr, hotpriceSaveRes) {
              // Handle Hotprice save error
              if (hotpriceSaveErr) {
                return done(hotpriceSaveErr);
              }

              // Set assertions on new Hotprice
              (hotpriceSaveRes.body.name).should.equal(hotprice.name);
              should.exist(hotpriceSaveRes.body.user);
              should.equal(hotpriceSaveRes.body.user._id, orphanId);

              // force the Hotprice to have an orphaned user reference
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

                    // Get the Hotprice
                    agent.get('/api/hotprices/' + hotpriceSaveRes.body._id)
                      .expect(200)
                      .end(function (hotpriceInfoErr, hotpriceInfoRes) {
                        // Handle Hotprice error
                        if (hotpriceInfoErr) {
                          return done(hotpriceInfoErr);
                        }

                        // Set assertions
                        (hotpriceInfoRes.body._id).should.equal(hotpriceSaveRes.body._id);
                        (hotpriceInfoRes.body.name).should.equal(hotprice.name);
                        should.equal(hotpriceInfoRes.body.user, undefined);

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
    Hotprice.remove().exec(function() {
      Shop.remove().exec(function(){
        User.remove().exec(function() {
          done();
        });
      });
    });
  });
});
