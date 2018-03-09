'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Ad = mongoose.model('Ad'),
  Categoryshop = mongoose.model('Categoryshop'),
  Shop = mongoose.model('Shop'),
  Hotprice = mongoose.model('Hotprice'),
  Categoryproduct = mongoose.model('Categoryproduct'),
  Product = mongoose.model('Product'),
  Benefitsetting = mongoose.model('Benefitsetting'),
  Coinbalance = mongoose.model('Coinbalance'),
  Bid = mongoose.model('Bid'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  ads1, ads2, ads3,
  categoryshop,
  shop1, shop2, shop3, shop4, shop5,
  hotprice1, hotprice2, hotprice3, hotprice4, hotprice5, hotprice6,
  benefitsetting,
  token;

/**
 * Shop routes tests
 */
describe('Customer Home Stories Test', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'admin',
      password: 'P@ssw0rd1234'
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
      roles: ['admin']
    });

    benefitsetting = new Benefitsetting({
      name: 'login',
      title: 'ยินดีด้วย',
      description: 'โปรโมชั่นประจำวัน คุณได้รับ 10 เหรียญ',
      remark: 'หมายเหตุ: 1 วันต่อครั้งเท่านั้น',
      image: './assets/imgs/Home-Collect.png',
      items: [{
        benefittype: 'coin',
        volume: 10
      }],
      user: user
    });

    ads1 = new Ad({
      image: "./assets/imgs/ads/ads1.png",
      isvideo: true,
      videoid: "###",
      status: true,
      user: user,
      created: new Date(2018, 1, 30)
    });

    ads2 = new Ad({
      image: "./assets/imgs/ads/ads2.png",
      isvideo: false,
      videoid: '',
      status: true,
      user: user,
      created: new Date(2018, 1, 29)
    });

    ads3 = new Ad({
      image: "./assets/imgs/ads/ads3.png",
      isvideo: true,
      videoid: "###",
      status: true,
      user: user,
      created: new Date(2018, 1, 28)
    });

    categoryshop = new Categoryshop({
      name: 'อาหารและเครื่องดื่ม',
      image: './assets/imgs/Catagory/cat0.png',
      imageen: './assets/imgs/Catagory/cat0.png'
    });

    shop1 = new Shop({
      name: 'ครัวคุณโก๋1',
      name_eng: 'Shop name english',
      detail: 'Coffice Idea Space',
      tel: '0894447208',
      email: 'test@gmail.com',
      facebook: 'facebook.com',
      line: '@lineid',
      address: {
        address: '88/8',
        addressdetail: 'ตรงข้าม big c',
        subdistinct: 'ลำลูกกา',
        distinct: 'ลำลูกกา',
        province: 'ปทุมธานี',
        postcode: '12150',
        lat: '13.9338949',
        lng: '100.6827773'
      },
      items: [],
      times: [{
        description: 'ทุกวัน',
        timestart: '07.00',
        timeend: '20.00',
        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      }],
      coverimage: 'http://www.hardrock.com/cafes/amsterdam/files/2308/LegendsRoom.jpg',
      promoteimage: ["http://soimilk.com/sites/default/files/u143056/13528419_497821473741911_1179151975926373336_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/841128_788347794565227_8687025660509098200_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/11402392_840851149314891_2781537114366370680_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/unnamed.jpg",
        "http://soimilk.com/sites/default/files/u143056/2458.jpg"
      ],
      isactiveshop: true,
      issendmail: false,
      islaunch: true,
      importform: 'manual',
      categories: [categoryshop],
      user: user
    });

    shop2 = new Shop({
      name: 'ครัวคุณโก๋2',
      name_eng: 'Shop name english',
      detail: 'Coffice Idea Space',
      tel: '0894447208',
      email: 'test@gmail.com',
      facebook: 'facebook.com',
      line: '@lineid',
      address: {
        address: '88/8',
        addressdetail: 'ตรงข้าม big c',
        subdistinct: 'ลำลูกกา',
        distinct: 'ลำลูกกา',
        province: 'ปทุมธานี',
        postcode: '12150',
        lat: '13.9338949',
        lng: '100.6827773'
      },
      items: [],
      times: [{
        description: 'ทุกวัน',
        timestart: '07.00',
        timeend: '20.00',
        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      }],
      coverimage: 'http://www.hardrock.com/cafes/amsterdam/files/2308/LegendsRoom.jpg',
      promoteimage: ["http://soimilk.com/sites/default/files/u143056/13528419_497821473741911_1179151975926373336_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/841128_788347794565227_8687025660509098200_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/11402392_840851149314891_2781537114366370680_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/unnamed.jpg",
        "http://soimilk.com/sites/default/files/u143056/2458.jpg"
      ],
      isactiveshop: true,
      issendmail: false,
      importform: 'manual',
      categories: [categoryshop],
      user: user
    });

    shop3 = new Shop({
      name: 'ครัวคุณโก๋3',
      name_eng: 'Shop name english',
      detail: 'Coffice Idea Space',
      tel: '0894447208',
      email: 'test@gmail.com',
      facebook: 'facebook.com',
      line: '@lineid',
      address: {
        address: '88/8',
        addressdetail: 'ตรงข้าม big c',
        subdistinct: 'ลำลูกกา',
        distinct: 'ลำลูกกา',
        province: 'ปทุมธานี',
        postcode: '12150',
        lat: '13.9338949',
        lng: '100.6827773'
      },
      items: [],
      times: [{
        description: 'ทุกวัน',
        timestart: '07.00',
        timeend: '20.00',
        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      }],
      coverimage: 'http://www.hardrock.com/cafes/amsterdam/files/2308/LegendsRoom.jpg',
      promoteimage: ["http://soimilk.com/sites/default/files/u143056/13528419_497821473741911_1179151975926373336_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/841128_788347794565227_8687025660509098200_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/11402392_840851149314891_2781537114366370680_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/unnamed.jpg",
        "http://soimilk.com/sites/default/files/u143056/2458.jpg"
      ],
      isactiveshop: true,
      issendmail: false,
      importform: 'manual',
      categories: [categoryshop],
      user: user
    });

    shop4 = new Shop({
      name: 'ครัวคุณโก๋4',
      name_eng: 'Shop name english',
      detail: 'Coffice Idea Space',
      tel: '0894447208',
      email: 'test@gmail.com',
      facebook: 'facebook.com',
      line: '@lineid',
      address: {
        address: '88/8',
        addressdetail: 'ตรงข้าม big c',
        subdistinct: 'ลำลูกกา',
        distinct: 'ลำลูกกา',
        province: 'ปทุมธานี',
        postcode: '12150',
        lat: '13.9338949',
        lng: '100.6827773'
      },
      items: [],
      times: [{
        description: 'ทุกวัน',
        timestart: '07.00',
        timeend: '20.00',
        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      }],
      coverimage: 'http://www.hardrock.com/cafes/amsterdam/files/2308/LegendsRoom.jpg',
      promoteimage: ["http://soimilk.com/sites/default/files/u143056/13528419_497821473741911_1179151975926373336_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/841128_788347794565227_8687025660509098200_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/11402392_840851149314891_2781537114366370680_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/unnamed.jpg",
        "http://soimilk.com/sites/default/files/u143056/2458.jpg"
      ],
      isactiveshop: false,
      issendmail: false,
      importform: 'manual',
      categories: [categoryshop],
      user: user
    });

    shop5 = new Shop({
      name: 'ครัวคุณโก๋5',
      name_eng: 'Shop name english',
      detail: 'Coffice Idea Space',
      tel: '0894447208',
      email: 'test@gmail.com',
      facebook: 'facebook.com',
      line: '@lineid',
      address: {
        address: '88/8',
        addressdetail: 'ตรงข้าม big c',
        subdistinct: 'ลำลูกกา',
        distinct: 'ลำลูกกา',
        province: 'ปทุมธานี',
        postcode: '12150',
        lat: '13.9338949',
        lng: '100.6827773'
      },
      items: [],
      times: [{
        description: 'ทุกวัน',
        timestart: '07.00',
        timeend: '20.00',
        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      }],
      coverimage: 'http://www.hardrock.com/cafes/amsterdam/files/2308/LegendsRoom.jpg',
      promoteimage: ["http://soimilk.com/sites/default/files/u143056/13528419_497821473741911_1179151975926373336_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/841128_788347794565227_8687025660509098200_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/11402392_840851149314891_2781537114366370680_o.jpg",
        "http://soimilk.com/sites/default/files/u143056/unnamed.jpg",
        "http://soimilk.com/sites/default/files/u143056/2458.jpg"
      ],
      isactiveshop: true,
      issendmail: false,
      importform: 'manual',
      categories: [categoryshop],
      user: user
    });

    hotprice1 = new Hotprice({
      name: 'Hotprice Name 1',
      image: './assets/imgs/hot_price/hotprice1.png',
      shop: shop1,
      user: user
    });

    hotprice2 = new Hotprice({
      name: 'Hotprice Name 2',
      image: './assets/imgs/hot_price/hotprice1.png',
      shop: shop2,
      user: user
    });

    hotprice3 = new Hotprice({
      name: 'Hotprice Name 3',
      image: './assets/imgs/hot_price/hotprice1.png',
      shop: shop3,
      user: user
    });

    hotprice4 = new Hotprice({
      name: 'Hotprice Name 4',
      image: './assets/imgs/hot_price/hotprice1.png',
      shop: shop4,
      user: user
    });

    hotprice5 = new Hotprice({
      name: 'Hotprice Name 5',
      image: './assets/imgs/hot_price/hotprice1.png',
      shop: shop5,
      user: user
    });

    hotprice6 = new Hotprice({
      name: 'Hotprice Name 6',
      image: './assets/imgs/hot_price/hotprice1.png',
      shop: shop2,
      user: user
    });


    token = '';
    // Save a user to the test db and create new Shop
    user.save(function () {
      benefitsetting.save();
      ads1.save();
      ads2.save();
      ads3.save();
      categoryshop.save(function () {
        shop1.save(function () {
          hotprice1.save();
        });
        shop2.save(function () {
          hotprice2.save();
          hotprice6.save();
        });
        shop3.save(function () {
          hotprice3.save();
        });
        shop4.save(function () {
          hotprice4.save();
        });
        shop5.save(function () {
          hotprice5.save();
        });
        done();
      });

    });
  });


  it('should be get Home data collection', function (done) {
    agent.get('/api/customer/home/13.933522813836749/100.71915294868768')
      .end(function (homeGetErr, homeGetRes) {
        // Handle Products save error
        if (homeGetErr) {
          return done(homeGetErr);
        }

        // Get Products list
        var home = homeGetRes.body;

        // Set assertions
        home.ads.should.not.be.empty();
        home.ads.items.should.be.instanceof(Array).and.have.lengthOf(3);
        home.hotprices.should.not.be.empty();
        home.hotprices.items1.should.be.instanceof(Array).and.have.lengthOf(6);
        home.hotprices.items2.should.be.instanceof(Array).and.have.lengthOf(0);
        home.categories.should.not.be.empty();
        home.categories.items.should.be.instanceof(Array).and.have.lengthOf(1);
        home.shops.should.not.be.empty();
        home.shops.should.be.instanceof(Array).and.have.lengthOf(3);
        home.shops[0].title.should.be.equal('NEAR_BY');
        home.shops[0].items.should.be.instanceof(Array).and.have.lengthOf(4);
        home.shops[1].title.should.be.equal('POPULAR');
        home.shops[1].items.should.be.instanceof(Array).and.have.lengthOf(4);
        home.shops[2].title.should.be.equal('FAVORITE');
        home.shops[2].items.should.be.instanceof(Array).and.have.lengthOf(4);
        // Call the assertion callback
        done();
      });
  });

  it('should be get Shops by Category', function (done) {
    agent.get('/api/customer/categoryshop/' + categoryshop._id + '/13.933522813836749/100.71915294868768')
      .end(function (shopByCateErr, shopByCateRes) {
        if (shopByCateErr) {
          return done(shopByCateErr);
        }

        // Get Products list
        var home = shopByCateRes.body;

        // Set assertions
        home.should.not.be.empty();
        home.should.be.instanceof(Array).and.have.lengthOf(2);
        home[0].title.should.be.equal('NEAR_BY');
        home[0].items.should.be.instanceof(Array).and.have.lengthOf(4);
        home[1].title.should.be.equal('POPULAR');
        home[1].items.should.be.instanceof(Array).and.have.lengthOf(4);
        // home[2].title.should.be.equal('FAVORITE');
        // home[2].items.should.be.instanceof(Array).and.have.lengthOf(4);
        done();

      });
  });

  it('should be get Shops by Condition', function (done) {
    agent.get('/api/customer/shops/' + 'POPULAR' + '/13.933522813836749/100.71915294868768')
      .end(function (shopByCondErr, shopByCondRes) {
        if (shopByCondErr) {
          return done(shopByCondErr);
        }

        // Get Products list
        var shopByCond = shopByCondRes.body;

        // Set assertions
        shopByCond.should.be.instanceof(Array).and.have.lengthOf(4);
        done();

      });
  });

  it('should be get Today Welcome', function (done) {
    agent.get('/api/customer/todaywelcome')
      .end(function (getErr, getRes) {
        if (getErr) {
          return done(getErr);
        }

        // Get Products list
        var gettoday = getRes.body;

        // Set assertions
        gettoday.title.should.be.equal('ยินดีด้วย');

        agent.get('/api/customer/todaywelcome')
          .end(function (getErr2, getRes2) {
            if (getErr2) {
              return done(getErr2);
            }

            // Get Products list
            var gettoday2 = getRes2.body;

            // Set assertions
            gettoday2.should.be.equal('today welcome already');
            done();

          });

      });
  });

  it('get vintage customer home', function (done) {
    var enddate = new Date();
    var bid = new Bid({
      name: 'Bid name',
      detail: 'bid detail',
      startprice: 50,
      bidprice: 100,
      price: 200,
      starttime: new Date(),
      endtime: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() + 2),
      image: ['https://www.felex-lederwaren.de/bilder/produkte/gross/Billy-the-Kid-by-Greenburry-Rebel-of-Vintage-Greenburry-Damenumhaengetasche-UEberschlagtasche-rot-braun.jpg'],
      user: user,
      created: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() + 2)
    });
    var bid2 = new Bid({
      name: 'Bid name2',
      detail: 'bid detail2',
      startprice: 502,
      bidprice: 1002,
      price: 2002,
      starttime: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() + 3),
      endtime: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() + 4),
      image: ['https://www.felex-lederwaren.de/bilder/produkte/gross/Billy-the-Kid-by-Greenburry-Rebel-of-Vintage-Greenburry-Damenumhaengetasche-UEberschlagtasche-rot-braun.jpg'],
      user: user,
      created: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() + 5)
    });

    var bid4 = new Bid({
      name: 'Bid name4',
      detail: 'bid detail4',
      startprice: 502,
      bidprice: 1002,
      price: 2002,
      starttime: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() - 2),
      endtime: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() - 2),
      image: ['https://www.felex-lederwaren.de/bilder/produkte/gross/Billy-the-Kid-by-Greenburry-Rebel-of-Vintage-Greenburry-Damenumhaengetasche-UEberschlagtasche-rot-braun.jpg'],
      user: user,
      created: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() + 4)
    });
    var startdate = new Date();
    startdate.setHours(0, 0, 0);
    var bid3endtime = new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() + 2);
    bid3endtime.setHours(12, 0, 0);
    var bid3 = new Bid({
      name: 'Bid name2',
      detail: 'bid detail2',
      startprice: 502,
      bidprice: 1002,
      price: 2002,
      starttime: startdate,
      endtime: bid3endtime,
      image: ['https://www.felex-lederwaren.de/bilder/produkte/gross/Billy-the-Kid-by-Greenburry-Rebel-of-Vintage-Greenburry-Damenumhaengetasche-UEberschlagtasche-rot-braun.jpg'],
      user: user,
      created: new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate() + 2)
    });
    bid3.save();
    bid.save();
    bid2.save();
    bid4.save();

    var categoryproduct = new Categoryproduct({
      name: 'อาหาร',
      priority: 1,
      image: 'image cate product',
      user: user,
    });
    categoryproduct.save();
    var bidProduct = new Product({
      name: 'Product name',
      detail: 'Product detail',
      price: 50,
      priorityofcate: 1,
      images: ['https://simg.kapook.com/o/photo/410/kapook_world-408206.jpg', 'https://f.ptcdn.info/408/051/000/oqi6tdf9uS1811y1XHx-o.png'],
      user: user,
      categories: categoryproduct,
      promotionprice: 40,
      isrecommend: false,
      ispromotionprice: true,
      shop: shop1,
      startdate: new Date(),
      expiredate: new Date(),
      created: new Date(2018, 1, 31)
    });
    bidProduct.save();
    agent.get('/api/vintagecustomerhome/1')
      .end(function (getErr2, getRes2) {
        if (getErr2) {
          return done(getErr2);
        }

        // Get Products list
        var gettoday2 = getRes2.body;

        // Set assertions
        gettoday2.bid.length.should.be.equal(3);
        gettoday2.bid[0].image.should.be.equal(bid3.image[0]);
        gettoday2.bid[0].isBid.should.be.equal(true);
        // gettoday2.bid[0].time.should.be.equal(true);

        gettoday2.bid[1].image.should.be.equal(bid.image[0]);
        gettoday2.bid[1].isBid.should.be.equal(true);
        // gettoday2.bid[1].time.should.be.equal(true);

        gettoday2.items.length.should.be.equal(4);
        gettoday2.items[0]._id.should.be.equal(bidProduct.id);
        gettoday2.items[0].image.should.be.equal(bidProduct.images[0]);
        gettoday2.items[0].imagecount.should.be.equal(2);
        gettoday2.items[0].isvideo.should.be.equal(false);
        gettoday2.items[0].type.should.be.equal('product');

        gettoday2.items[1]._id.should.be.equal(ads1.id);
        gettoday2.items[1].image.should.be.equal(ads1.image);
        gettoday2.items[1].imagecount.should.be.equal(1);
        gettoday2.items[1].isvideo.should.be.equal(true);
        gettoday2.items[1].type.should.be.equal('ads');

        gettoday2.items[2]._id.should.be.equal(ads2.id);
        gettoday2.items[2].image.should.be.equal(ads2.image);
        gettoday2.items[2].imagecount.should.be.equal(1);
        gettoday2.items[2].isvideo.should.be.equal(false);
        gettoday2.items[2].type.should.be.equal('ads');

        gettoday2.items[3]._id.should.be.equal(ads3.id);
        gettoday2.items[3].image.should.be.equal(ads3.image);
        gettoday2.items[3].imagecount.should.be.equal(1);
        gettoday2.items[3].isvideo.should.be.equal(true);
        gettoday2.items[3].type.should.be.equal('ads');
        done();

      });
  });

  afterEach(function (done) {
    Coinbalance.remove().exec(function () {
      Benefitsetting.remove().exec(function () {
        User.remove().exec(function () {
          Hotprice.remove().exec(function () {
            Shop.remove().exec(function () {
              Bid.remove().exec(function () {
                Product.remove().exec(function () {
                  Categoryproduct.remove().exec(function () {
                    Categoryshop.remove().exec(function () {
                      Ad.remove().exec(done);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });


  });
});
