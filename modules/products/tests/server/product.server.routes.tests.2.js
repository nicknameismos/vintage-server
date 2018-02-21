'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Product = mongoose.model('Product'),
  Shop = mongoose.model('Shop'),
  Categoryshop = mongoose.model('Categoryshop'),
  Categoryproduct = mongoose.model('Categoryproduct'),
  Shippingmaster = mongoose.model('Shippingmaster'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  categoryshop,
  categoryproduct,
  shop,
  agent,
  credentials,
  user,
  token,
  shippings,
  product;

/**
 * Product routes tests
 */
describe('Product CRUD tests with token add shipping', function () {

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

    token = '';
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

    categoryshop = new Categoryshop({
      name: 'อาหารและเครื่องดื่ม'
    });

    categoryproduct = new Categoryproduct({
      name: 'อาหาร',
      priority: 1,
      image: 'image cate product',
      user: user,
      shop: shop
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
      categories: categoryshop,
      user: user
    });
    shippings = new Shippingmaster({
      name: 'free',
      detail: 'sent product in 7 days'
    });
    // Save a user to the test db and create new Product
    user.save(function () {
      shop.save(function () {
        categoryproduct.save(function () {
          shippings.save(function () {
            product = {
              name: 'Product name',
              detail: 'Product detail',
              price: 50,
              priorityofcate: 1,
              images: ['https://simg.kapook.com/o/photo/410/kapook_world-408206.jpg', 'https://f.ptcdn.info/408/051/000/oqi6tdf9uS1811y1XHx-o.png'],
              user: user,
              categories: categoryproduct,
              shop: shop,
              promotionprice: 40,
              isrecommend: false,
              ispromotionprice: true,
              startdate: new Date(),
              expiredate: new Date(),
              shippings: [{
                ref: shippings,
                price: 20
              }]
            };
          });
        });
      });


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


  it('should be have Token logged in', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('should be able to save a Product and get product list if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        // Get a list of Products
        agent.get('/api/products')
          .end(function (productsGetErr, productsGetRes) {
            // Handle Products save error
            if (productsGetErr) {
              return done(productsGetErr);
            }

            // Get Products list
            var products = productsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (products[0].name).should.match('Product name');
            (products[0].detail).should.match('Product detail');
            (products[0].shippings.length).should.match(1);
            (products[0].shippings[0].ref.name).should.match(shippings.name);
            (products[0].shippings[0].ref.detail).should.match(shippings.detail);
            (products[0].shippings[0].price).should.match(20);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to save a Product and get product detail if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        // Get a list of Products
        agent.get('/api/products/' + productSaveRes.body._id)
          .end(function (productsGetErr, productsGetRes) {
            // Handle Products save error
            if (productsGetErr) {
              return done(productsGetErr);
            }

            // Get Products list
            var products = productsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (products.name).should.match('Product name');
            (products.detail).should.match('Product detail');
            (products.shippings.length).should.match(1);
            (products.shippings[0].ref.name).should.match(shippings.name);
            (products.shippings[0].ref.detail).should.match(shippings.detail);
            (products.shippings[0].price).should.match(20);

            // Call the assertion callback
            done();
          });
      });
  });

  it('get product list by shop', function (done) {
    var ProductObj = new Product(product);

    ProductObj.save();
    agent.get('/api/getproductlistbyshop/' + shop.id)
      .set('authorization', 'Bearer ' + token)
      .end(function (productsGetErr, productsGetRes) {
        // Handle Products save error
        if (productsGetErr) {
          return done(productsGetErr);
        }
        var products = productsGetRes.body;

        (products.length).should.match(1);
        (products[0]._id).should.match(ProductObj.id);
        (products[0].name).should.match(ProductObj.name);
        (products[0].image).should.match(ProductObj.images[0]);
        (products[0].price).should.match(ProductObj.price);
        (products[0].cateid).should.match(ProductObj.categories.id);
        (products[0].ispromotion).should.match(ProductObj.ispromotionprice);
        (products[0].isrecommend).should.match(ProductObj.isrecommend);
        (products[0].ispopular).should.match(false);
        (products[0].shippings.length).should.match(1);
        (products[0].shippings[0].ref.name).should.match(shippings.name);
        (products[0].shippings[0].ref.detail).should.match(shippings.detail);
        (products[0].shippings[0].price).should.match(20);
        done();
      });
  });


  it('get product detail', function (done) {
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        var productObj = productSaveRes.body;
        agent.get('/api/customerproductdetail/' + productSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .end(function (productGetErr, productsGetRes) {
            // Handle Product save error
            if (productGetErr) {
              return done(productGetErr);
            }
            // Get Products list
            var product = productsGetRes.body;

            // Set assertions
            (product._id).should.match(productObj._id);
            (product.name).should.match(productObj.name);
            (product.images[0]).should.match(productObj.images[0]);
            (product.images[1]).should.match(productObj.images[1]);
            (product.price).should.match(productObj.ispromotionprice ? productObj.promotionprice : productObj.price);
            (product.detail).should.match(productObj.detail);
            (product.shippings.length).should.match(1);
            (product.shippings[0].ref.name).should.match(shippings.name);
            (product.shippings[0].ref.detail).should.match(shippings.detail);
            (product.shippings[0].price).should.match(20);
            (product.shopid).should.match(shop.id);
            done();
          });
      });

  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Shop.remove().exec(function () {
        Categoryproduct.remove().exec(function () {
          Shippingmaster.remove().exec(function () {
            Product.remove().exec(done);
          });
        });
      });
    });
  });
});
