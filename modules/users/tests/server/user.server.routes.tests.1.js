'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, _user, _cust, _shop, _biker, admin;

/**
 * User routes tests
 */
describe('User Mng tests', function () {

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
      provider: 'local'
    };

    _cust = {
      firstName: 'Customer',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'cust@test.com',
      username: 'Customer',
      password: 'P@ssw0rd####',
      provider: 'local'
    };



    _shop = {
      firstName: 'Shop',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'shop@test.com',
      username: 'shop',
      password: 'pass22wrwrwr##',
      provider: 'local',
      //roles: ['shop']
    };

    _biker = {
      firstName: 'Biker',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'biker@test.com',
      username: 'biker',
      password: 'pass22wrwrwr##',
      provider: 'local',
      //roles: ['biker']
    };

    var cust = new User(_cust);
    cust.save();
    var biker = new User(_biker);
    biker.save();
    var shop = new User(_shop);
    shop.save();

    user = new User(_user);

    // Save a user to the test db and create new article
    user.save(function (err) {
      should.not.exist(err);
      done();
    });
  });



  it('should not be able to retrieve a list of users(paging server) if not admin', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Request list of users
        agent.post('/api/management/paging/users')
          .send({
            currentpage: 1,
            role: 'user',
            keyword: ''
          })
          .expect(403)
          .end(function (usersGetErr, usersGetRes) {
            if (usersGetErr) {
              return done(usersGetErr);
            }

            return done();
          });
      });
  });

  it('should be able to retrieve a list of users(paging server) if admin', function (done) {
    user.roles = ['user', 'admin'];

    user.save(function (err) {
      should.not.exist(err);
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Request list of users
          agent.post('/api/management/paging/users')
            .send({
              currentpage: 1,
              role: 'user',
              keyword: ''
            })
            .expect(200)
            .end(function (usersGetErr, usersGetRes) {
              if (usersGetErr) {
                return done(usersGetErr);
              }

              usersGetRes.body.items.should.be.instanceof(Array).and.have.lengthOf(4);
              usersGetRes.body.pagings.should.be.instanceof(Array).and.have.lengthOf(1);
              // usersGetRes.body.filterrole[0].users.should.be.instanceof(Array).and.have.lengthOf(2);
              // usersGetRes.body.filterrole[1].users.should.be.instanceof(Array).and.have.lengthOf(1);
              // usersGetRes.body.filterrole[2].users.should.be.instanceof(Array).and.have.lengthOf(1);
              // usersGetRes.body.filterrole[3].users.should.be.instanceof(Array).and.have.lengthOf(1);

              // Call the assertion callback
              return done();
            });
        });
    });
  });

  it('update user', function (done) {
    user.roles = ['shop'];

    user.save(function (err) {
      should.not.exist(err);
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          var editUser = {
            profileImageURL: 'mypic.jpg',
            firstName: 'my name is',
            lastName: 'my lastname is',
            dateOfBirth: new Date(),
            citizenid: '12150',
            bankaccount: '1122233'
          };
          // Request list of users
          agent.put('/api/usermanage/' + user.id)
            .send(editUser)
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .expect(200)
            .end(function (usersGetErr, usersGetRes) {
              if (usersGetErr) {
                return done(usersGetErr);
              }

              var user = usersGetRes.body;
              (user.profileImageURL).should.match(editUser.profileImageURL);
              (user.firstName).should.match(editUser.firstName);
              (user.lastName).should.match(editUser.lastName);
              (user.dateOfBirth).should.match(editUser.dateOfBirth);
              (user.citizenid).should.match(editUser.citizenid);
              (user.bankaccount).should.match(editUser.bankaccount);
              done();
            });
        });
    });
  });

  it('get users by admin', function (done) {
    user.roles = ['admin'];
    var creUserObj = {
      username: 'usernaja',
      password: '222'
    };
    var userObj = new User({
      firstName: 'Full22',
      lastName: 'Name22',
      displayName: 'Full22 Name22',
      email: 'test2@test.com',
      username: creUserObj.username,
      password: creUserObj.password,
      provider: 'local',
      roles: ['user']
    });

    var creShopObj = {
      username: 'usernaja',
      password: '222'
    };
    var ShopObj = new User({
      firstName: 'Full2233',
      lastName: 'Name2233',
      displayName: 'Full2233 Name2233',
      email: 'test3@test.com',
      username: creShopObj.username,
      password: creShopObj.password,
      provider: 'local',
      roles: ['shop']
    });
    userObj.save();
    ShopObj.save();
    user.save(function (err) {
      should.not.exist(err);
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          var item = {
            title: '',
            currentpage: 0,
            keyword: ''
          };
          // Request list of users
          agent.post('/api/getusersbyadmin')
            .send(item)
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .expect(200)
            .end(function (usersGetErr, usersGetRes) {
              if (usersGetErr) {
                return done(usersGetErr);
              }

              var user = usersGetRes.body;
              (user.titles.length).should.match(3);
              (user.titles[0]).should.match('ลูกค้า');
              (user.titles[1]).should.match('เจ้าของร้าน');
              (user.titles[2]).should.match('แอดมิน');
              (user.items.length).should.match(4);
              (user.paging.length).should.match(1);
              done();
            });
        });
    });
  });

  it('get users by admin and search', function (done) {
    user.roles = ['admin'];
    var creUserObj = {
      username: 'usernaja',
      password: '222'
    };
    var userObj = new User({
      firstName: 'Full22',
      lastName: 'Name22',
      displayName: 'Full22 Name22',
      email: 'test2@test.com',
      username: creUserObj.username,
      password: creUserObj.password,
      provider: 'local',
      roles: ['user']
    });

    var creShopObj = {
      username: 'usernaja',
      password: '222'
    };
    var ShopObj = new User({
      firstName: 'Full2233',
      lastName: 'Name2233',
      displayName: 'Full2233 Name2233',
      email: 'test3@test.com',
      username: creShopObj.username,
      password: creShopObj.password,
      provider: 'local',
      roles: ['shop']
    });
    userObj.save();
    ShopObj.save();
    user.save(function (err) {
      should.not.exist(err);
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          var item = {
            title: 'แอดมิน',
            currentpage: 0,
            keyword: ''
          };
          // Request list of users
          agent.post('/api/getusersbyadmin')
            .send(item)
            .set('authorization', 'Bearer ' + signinRes.body.loginToken)
            .expect(200)
            .end(function (usersGetErr, usersGetRes) {
              if (usersGetErr) {
                return done(usersGetErr);
              }

              var user = usersGetRes.body;
              (user.titles.length).should.match(3);
              (user.titles[0]).should.match('ลูกค้า');
              (user.titles[1]).should.match('เจ้าของร้าน');
              (user.titles[2]).should.match('แอดมิน');
              (user.items.length).should.match(1);
              (user.paging.length).should.match(1);
              done();
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(done);
  });
});
