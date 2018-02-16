'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shop = mongoose.model('Shop'),
  Categoryshop = mongoose.model('Categoryshop'),
  Categoryproduct = mongoose.model('Categoryproduct'),
  Product = mongoose.model('Product'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  categoryshop,
  categoryproduct,
  products,
  shop;

/**
 * Shop routes tests
 */
describe('Shop CRUD edit and delete items token tests', function () {

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

    categoryproduct = new Categoryproduct({
      name: 'Categoryproduct name',
      priority: 1,
      image: 'dsfasfd',
      user: user
    });

    categoryshop = new Categoryshop({
      name: 'อาหารและเคื่องดื่ม'
    });

    products = new Product({
      name: 'Product name',
      price: 50,
      priorityofcate: 1,
      images: ['https://simg.kapook.com/o/photo/410/kapook_world-408206.jpg', 'https://f.ptcdn.info/408/051/000/oqi6tdf9uS1811y1XHx-o.png'],
      user: user,
      categories: categoryproduct
    });
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

    token = '';
    // Save a user to the test db and create new Shop
    user.save(function () {
      categoryshop.save(function () {
        categoryproduct.save(function () {

          products.save(function () {

            shop = {
              name: 'ครัวคุณโก๋',
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
              islaunch: true,
              categories: [categoryshop],
              user: user,
              shopowner: user
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

  it('should be have Token logged in with token', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('delete product update shop', function (done) {
    // Save a new Shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.put('/api/shops/createusershop/' + shopSaveRes.body._id)
          .expect(200)
          .end(function (createusershopErr, createusershopRes) {
            // Handle signin error
            if (createusershopErr) {
              return done(createusershopErr);
            }
            var newcredentials = {
              username: shop.email,
              password: 'user1234'
            };
            agent.post('/api/auth/signin')
              .send(newcredentials)
              .expect(200)
              .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                  return done(signinErr);
                }
                agent.get('/api/shopshome')
                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                  .expect(200)
                  .end(function (shopGetErr, shopsGetRes) {
                    if (shopGetErr) {
                      return done(shopGetErr);
                    }
                    var shops = shopsGetRes.body;
                    (shops.coverimage).should.match(shop.coverimage);
                    (shops.promoteimage).should.match(shop.promoteimage);
                    (shops.items.length).should.match(0);
                    var cate = {
                      name: 'catename',
                      image: 'url_image',
                    };
                    agent.put('/api/createcate/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(cate)
                      .expect(200)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        // (shopchange.message).should.match('Promote images is limited.');
                        (shopchange.coverimage).should.match(shop.coverimage);
                        (shopchange.promoteimage).should.match(shop.promoteimage);
                        (shopchange.items.length).should.match(1);
                        (shopchange.items[0].cate.name).should.match(cate.name);
                        (shopchange.items[0].products.length).should.match(30);

                        agent.get('/api/shops/' + shops._id)
                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                          .expect(200)
                          .end(function (shopxGetErr, shopsxGetRes) {
                            if (shopxGetErr) {
                              return done(shopxGetErr);
                            }
                            var shopsssxxx = shopsxGetRes.body;
                            (shopsssxxx.coverimage).should.match(shop.coverimage);
                            (shopsssxxx.promoteimage).should.match(shop.promoteimage);
                            (shopsssxxx.items.length).should.match(1);
                            (shopsssxxx.items[0].products.length).should.match(30);
                            // (shopsssxxx.items[0].products[0].name).should.match('sadf');
                            var productCreate = {
                              name: 'sadf',
                              images: ['asdf', 'asdf'],
                              price: 1234,
                              categories: shopchange.items[0].cate,
                              index: 0,
                              cateindex: 0
                            };
                            agent.put('/api/createproduct/' + shops._id)
                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                              .send(productCreate)
                              .expect(200)
                              .end(function (createproductErr, createproductRes) {
                                // Handle signin error
                                if (createproductErr) {
                                  return done(createproductErr);
                                }
                                var shopProduct = createproductRes.body;
                                (shopProduct.coverimage).should.match(shop.coverimage);
                                (shopProduct.promoteimage).should.match(shop.promoteimage);
                                (shopProduct.items.length).should.match(1);
                                (shopProduct.items[0].cate.name).should.match(cate.name);
                                (shopProduct.items[0].products.length).should.match(30);
                                var productCreate2 = {
                                  name: 'sadf2',
                                  images: ['asdf2', 'asdf'],
                                  price: 1234,
                                  categories: shopchange.items[0].cate,
                                  index: 1,
                                  cateindex: 0
                                };
                                agent.put('/api/createproduct/' + shops._id)
                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                  .send(productCreate2)
                                  .expect(200)
                                  .end(function (createproduct2Err, createproduct2Res) {
                                    // Handle signin error
                                    if (createproduct2Err) {
                                      return done(createproduct2Err);
                                    }
                                    var shopProduct2 = createproduct2Res.body;
                                    (shopProduct2.coverimage).should.match(shop.coverimage);
                                    (shopProduct2.promoteimage).should.match(shop.promoteimage);
                                    (shopProduct2.items.length).should.match(1);
                                    (shopProduct2.items[0].products.length).should.match(30);
                                    (shopProduct2.items[0].cate.name).should.match(cate.name);
                                    agent.get('/api/shops/' + shops._id)
                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                      .expect(200)
                                      .end(function (shopxGetErr, shopsxGetRes) {
                                        if (shopxGetErr) {
                                          return done(shopxGetErr);
                                        }
                                        var shopsssx = shopsxGetRes.body;
                                        (shopsssx.coverimage).should.match(shop.coverimage);
                                        (shopsssx.promoteimage).should.match(shop.promoteimage);
                                        (shopsssx.items.length).should.match(1);
                                        (shopsssx.items[0].products.length).should.match(30);
                                        (shopsssx.items[0].products[0].name).should.match('sadf');
                                        (shopsssx.items[0].products[1].name).should.match('sadf2');
                                        agent.get('/api/products')
                                          .expect(200)
                                          .end(function (productsGetErr, productsGetRes) {
                                            if (productsGetErr) {
                                              return done(productsGetErr);
                                            }
                                            var productsRes = productsGetRes.body;
                                            (productsRes.length).should.match(4);

                                            agent.get('/api/shopshome')
                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                              .expect(200)
                                              .end(function (shopresGetErr, shopsresGetRes) {
                                                // Handle shop save error
                                                if (shopresGetErr) {
                                                  return done(shopresGetErr);
                                                }
                                                // Get shop list
                                                var shopsres = shopsresGetRes.body;
                                                (shopsres.coverimage).should.match(shop.coverimage);
                                                (shopsres.promoteimage).should.match(shop.promoteimage);
                                                (shopsres.items.length).should.match(1);
                                                (shopsres.items.length).should.match(1);
                                                (shopsres.items[0].products.length).should.match(30);
                                                (shopsres.items[0].products[0].name).should.match('sadf');
                                                (shopsres.items[0].products[1].name).should.match('sadf2');
                                                (shopsres.items[0].products[2].name).should.match('');
                                                var deleteProduct = {
                                                  _id: shopsres.items[0].products[1]._id,
                                                  index: 1,
                                                  cateindex: 0
                                                };
                                                agent.put('/api/deleteproduct/' + shops._id)
                                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                  .send(deleteProduct)
                                                  .expect(200)
                                                  .end(function (deleteproduct2Err, deleteproduct2Res) {
                                                    // Handle signin error
                                                    if (deleteproduct2Err) {
                                                      return done(deleteproduct2Err);
                                                    }

                                                    agent.get('/api/products')
                                                      .expect(200)
                                                      .end(function (products2GetErr, products2GetRes) {
                                                        if (products2GetErr) {
                                                          return done(products2GetErr);
                                                        }
                                                        var products2Res = products2GetRes.body;
                                                        (products2Res.length).should.match(3);
                                                        agent.get('/api/shopshome')
                                                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                          .expect(200)
                                                          .end(function (shopresGetErr2, shopsresGetRes2) {
                                                            // Handle shop save error
                                                            if (shopresGetErr2) {
                                                              return done(shopresGetErr2);
                                                            }
                                                            // Get shop list
                                                            var shopsres2 = shopsresGetRes2.body;
                                                            (shopsres2.coverimage).should.match(shop.coverimage);
                                                            (shopsres2.promoteimage).should.match(shop.promoteimage);
                                                            (shopsres2.items.length).should.match(1);
                                                            (shopsres2.items.length).should.match(1);
                                                            (shopsres2.items[0].products.length).should.match(30);
                                                            (shopsres2.items[0].products[0].name).should.match('sadf');
                                                            (shopsres2.items[0].products[1].name).should.match('');
                                                            (shopsres2.items[0].products[2].name).should.match('');
                                                            done();
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
              });
          });

      });
  });

  it('delete cate update shop', function (done) {
    // Save a new Shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.put('/api/shops/createusershop/' + shopSaveRes.body._id)
          .expect(200)
          .end(function (createusershopErr, createusershopRes) {
            // Handle signin error
            if (createusershopErr) {
              return done(createusershopErr);
            }
            var newcredentials = {
              username: shop.email,
              password: 'user1234'
            };
            agent.post('/api/auth/signin')
              .send(newcredentials)
              .expect(200)
              .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                  return done(signinErr);
                }
                agent.get('/api/shopshome')
                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                  .expect(200)
                  .end(function (shopGetErr, shopsGetRes) {
                    if (shopGetErr) {
                      return done(shopGetErr);
                    }
                    var shops = shopsGetRes.body;
                    (shops.coverimage).should.match(shop.coverimage);
                    (shops.promoteimage).should.match(shop.promoteimage);
                    (shops.items.length).should.match(0);
                    var cate = {
                      name: 'catename',
                      image: 'url_image',
                    };
                    agent.put('/api/createcate/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(cate)
                      .expect(200)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var cate3 = {
                          name: 'catename3',
                          image: 'url_image3',
                        };
                        agent.put('/api/createcate/' + shops._id)
                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                          .send(cate3)
                          .expect(200)
                          .end(function (changecoverErr33, changecoverRes33) {
                            // Handle signin error
                            if (changecoverErr33) {
                              return done(changecoverErr33);
                            }
                            var cate2 = {
                              name: 'catename2',
                              image: 'url_image2',
                            };
                            agent.put('/api/createcate/' + shops._id)
                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                              .send(cate2)
                              .expect(200)
                              .end(function (changecoverErrss, changecoverResss) {
                                // Handle signin error
                                if (changecoverErrss) {
                                  return done(changecoverErrss);
                                }
                                var shopchange = changecoverResss.body;

                                // (shopchange.message).should.match('Promote images is limited.');
                                (shopchange.coverimage).should.match(shop.coverimage);
                                (shopchange.promoteimage).should.match(shop.promoteimage);
                                (shopchange.items.length).should.match(3);
                                (shopchange.items[0].cate.name).should.match(cate.name);
                                (shopchange.items[0].products.length).should.match(30);

                                agent.get('/api/shops/' + shops._id)
                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                  .expect(200)
                                  .end(function (shopxGetErr, shopsxGetRes) {
                                    if (shopxGetErr) {
                                      return done(shopxGetErr);
                                    }
                                    var shopsssxxx = shopsxGetRes.body;
                                    (shopsssxxx.coverimage).should.match(shop.coverimage);
                                    (shopsssxxx.promoteimage).should.match(shop.promoteimage);
                                    (shopsssxxx.items.length).should.match(3);
                                    (shopsssxxx.items[0].products.length).should.match(30);
                                    // (shopsssxxx.items[0].products[0].name).should.match('sadf');
                                    var productCreate = {
                                      name: 'sadf',
                                      images: ['asdf', 'asdf'],
                                      price: 1234,
                                      categories: shopchange.items[0].cate,
                                      index: 0,
                                      cateindex: 0
                                    };
                                    agent.put('/api/createproduct/' + shops._id)
                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                      .send(productCreate)
                                      .expect(200)
                                      .end(function (createproductErr, createproductRes) {
                                        // Handle signin error
                                        if (createproductErr) {
                                          return done(createproductErr);
                                        }
                                        var shopProduct = createproductRes.body;
                                        (shopProduct.coverimage).should.match(shop.coverimage);
                                        (shopProduct.promoteimage).should.match(shop.promoteimage);
                                        (shopProduct.items.length).should.match(3);
                                        (shopProduct.items[0].cate.name).should.match(cate.name);
                                        (shopProduct.items[0].products.length).should.match(30);
                                        var productCreate2 = {
                                          name: 'sadf2',
                                          images: ['asdf2', 'asdf'],
                                          price: 1234,
                                          categories: shopchange.items[0].cate,
                                          index: 1,
                                          cateindex: 0
                                        };
                                        agent.put('/api/createproduct/' + shops._id)
                                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                          .send(productCreate2)
                                          .expect(200)
                                          .end(function (createproduct2Err, createproduct2Res) {
                                            // Handle signin error
                                            if (createproduct2Err) {
                                              return done(createproduct2Err);
                                            }
                                            var shopProduct2 = createproduct2Res.body;
                                            (shopProduct2.coverimage).should.match(shop.coverimage);
                                            (shopProduct2.promoteimage).should.match(shop.promoteimage);
                                            (shopProduct2.items.length).should.match(3);
                                            (shopProduct2.items[0].products.length).should.match(30);
                                            (shopProduct2.items[0].cate.name).should.match(cate.name);
                                            agent.get('/api/shops/' + shops._id)
                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                              .expect(200)
                                              .end(function (shopxGetErr, shopsxGetRes) {
                                                if (shopxGetErr) {
                                                  return done(shopxGetErr);
                                                }
                                                var shopsssx = shopsxGetRes.body;
                                                (shopsssx.coverimage).should.match(shop.coverimage);
                                                (shopsssx.promoteimage).should.match(shop.promoteimage);
                                                (shopsssx.items.length).should.match(3);
                                                (shopsssx.items[0].products.length).should.match(30);
                                                (shopsssx.items[0].products[0].name).should.match('sadf');
                                                (shopsssx.items[0].products[1].name).should.match('sadf2');
                                                agent.get('/api/products')
                                                  .expect(200)
                                                  .end(function (productsGetErr, productsGetRes) {
                                                    if (productsGetErr) {
                                                      return done(productsGetErr);
                                                    }
                                                    var productsRes = productsGetRes.body;
                                                    (productsRes.length).should.match(4);

                                                    agent.get('/api/shopshome')
                                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                      .expect(200)
                                                      .end(function (shopresGetErr, shopsresGetRes) {
                                                        // Handle shop save error
                                                        if (shopresGetErr) {
                                                          return done(shopresGetErr);
                                                        }
                                                        // Get shop list
                                                        var shopsres = shopsresGetRes.body;
                                                        (shopsres.coverimage).should.match(shop.coverimage);
                                                        (shopsres.promoteimage).should.match(shop.promoteimage);
                                                        (shopsres.items.length).should.match(3);
                                                        (shopsres.items[0].products.length).should.match(30);
                                                        (shopsres.items[0].products[0].name).should.match('sadf');
                                                        (shopsres.items[0].products[1].name).should.match('sadf2');
                                                        (shopsres.items[0].products[2].name).should.match('');
                                                        var datadelete = {
                                                          cateId: shopsres.items[0].cate._id
                                                        };
                                                        agent.put('/api/deletecateproduct/' + shops._id)
                                                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                          .send(datadelete)
                                                          .expect(200)
                                                          .end(function (deleteproduct2Err, deleteproduct2Res) {
                                                            // Handle signin error
                                                            if (deleteproduct2Err) {
                                                              return done(deleteproduct2Err);
                                                            }

                                                            agent.get('/api/products')
                                                              .expect(200)
                                                              .end(function (products2GetErr, products2GetRes) {
                                                                if (products2GetErr) {
                                                                  return done(products2GetErr);
                                                                }
                                                                var products2Res = products2GetRes.body;
                                                                (products2Res.length).should.match(2);
                                                                agent.get('/api/shopshome')
                                                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                  .expect(200)
                                                                  .end(function (shopresGetErr2, shopsresGetRes2) {
                                                                    // Handle shop save error
                                                                    if (shopresGetErr2) {
                                                                      return done(shopresGetErr2);
                                                                    }
                                                                    // Get shop list
                                                                    var shopsres2 = shopsresGetRes2.body;
                                                                    (shopsres2.coverimage).should.match(shop.coverimage);
                                                                    (shopsres2.promoteimage).should.match(shop.promoteimage);
                                                                    (shopsres2.items.length).should.match(2);
                                                                    (shopsres2.items[0].cate.name).should.match('catename3');
                                                                    (shopsres2.items[1].cate.name).should.match('catename2');
                                                                    done();
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
                      });
                  });
              });
          });

      });
  });

  it('update items shop', function (done) {
    // Save a new Shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.put('/api/shops/createusershop/' + shopSaveRes.body._id)
          .expect(200)
          .end(function (createusershopErr, createusershopRes) {
            // Handle signin error
            if (createusershopErr) {
              return done(createusershopErr);
            }
            var newcredentials = {
              username: shop.email,
              password: 'user1234'
            };
            agent.post('/api/auth/signin')
              .send(newcredentials)
              .expect(200)
              .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                  return done(signinErr);
                }
                agent.get('/api/shopshome')
                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                  .expect(200)
                  .end(function (shopGetErr, shopsGetRes) {
                    if (shopGetErr) {
                      return done(shopGetErr);
                    }
                    var shops = shopsGetRes.body;
                    (shops.coverimage).should.match(shop.coverimage);
                    (shops.promoteimage).should.match(shop.promoteimage);
                    (shops.items.length).should.match(0);
                    var cate = {
                      name: 'catename',
                      image: 'url_image',
                    };
                    agent.put('/api/createcate/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(cate)
                      .expect(200)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        // (shopchange.message).should.match('Promote images is limited.');
                        (shopchange.coverimage).should.match(shop.coverimage);
                        (shopchange.promoteimage).should.match(shop.promoteimage);
                        (shopchange.items.length).should.match(1);
                        (shopchange.items[0].cate.name).should.match(cate.name);
                        (shopchange.items[0].products.length).should.match(30);

                        agent.get('/api/shops/' + shops._id)
                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                          .expect(200)
                          .end(function (shopxGetErr, shopsxGetRes) {
                            if (shopxGetErr) {
                              return done(shopxGetErr);
                            }
                            var shopsssxxx = shopsxGetRes.body;
                            (shopsssxxx.coverimage).should.match(shop.coverimage);
                            (shopsssxxx.promoteimage).should.match(shop.promoteimage);
                            (shopsssxxx.items.length).should.match(1);
                            (shopsssxxx.items[0].products.length).should.match(30);
                            // (shopsssxxx.items[0].products[0].name).should.match('sadf');
                            var productCreate = {
                              name: 'sadf',
                              images: ['asdf', 'asdf'],
                              price: 1234,
                              categories: shopchange.items[0].cate,
                              index: 0,
                              cateindex: 0
                            };
                            agent.put('/api/createproduct/' + shops._id)
                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                              .send(productCreate)
                              .expect(200)
                              .end(function (createproductErr, createproductRes) {
                                // Handle signin error
                                if (createproductErr) {
                                  return done(createproductErr);
                                }
                                var shopProduct = createproductRes.body;
                                (shopProduct.coverimage).should.match(shop.coverimage);
                                (shopProduct.promoteimage).should.match(shop.promoteimage);
                                (shopProduct.items.length).should.match(1);
                                (shopProduct.items[0].cate.name).should.match(cate.name);
                                (shopProduct.items[0].products.length).should.match(30);
                                var productCreate2 = {
                                  name: 'sadf2',
                                  images: ['asdf2', 'asdf'],
                                  price: 1234,
                                  categories: shopchange.items[0].cate,
                                  index: 1,
                                  cateindex: 0
                                };
                                agent.put('/api/createproduct/' + shops._id)
                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                  .send(productCreate2)
                                  .expect(200)
                                  .end(function (createproduct2Err, createproduct2Res) {
                                    // Handle signin error
                                    if (createproduct2Err) {
                                      return done(createproduct2Err);
                                    }
                                    var shopProduct2 = createproduct2Res.body;
                                    (shopProduct2.coverimage).should.match(shop.coverimage);
                                    (shopProduct2.promoteimage).should.match(shop.promoteimage);
                                    (shopProduct2.items.length).should.match(1);
                                    (shopProduct2.items[0].products.length).should.match(30);
                                    (shopProduct2.items[0].cate.name).should.match(cate.name);
                                    agent.get('/api/shops/' + shops._id)
                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                      .expect(200)
                                      .end(function (shopxGetErr, shopsxGetRes) {
                                        if (shopxGetErr) {
                                          return done(shopxGetErr);
                                        }
                                        var shopsssx = shopsxGetRes.body;
                                        (shopsssx.coverimage).should.match(shop.coverimage);
                                        (shopsssx.promoteimage).should.match(shop.promoteimage);
                                        (shopsssx.items.length).should.match(1);
                                        (shopsssx.items[0].products.length).should.match(30);
                                        (shopsssx.items[0].products[0].name).should.match('sadf');
                                        (shopsssx.items[0].products[1].name).should.match('sadf2');
                                        agent.get('/api/products')
                                          .expect(200)
                                          .end(function (productsGetErr, productsGetRes) {
                                            if (productsGetErr) {
                                              return done(productsGetErr);
                                            }
                                            var productsRes = productsGetRes.body;
                                            (productsRes.length).should.match(4);

                                            agent.get('/api/shopshome')
                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                              .expect(200)
                                              .end(function (shopresGetErr, shopsresGetRes) {
                                                // Handle shop save error
                                                if (shopresGetErr) {
                                                  return done(shopresGetErr);
                                                }
                                                // Get shop list
                                                var shopsres = shopsresGetRes.body;
                                                (shopsres.coverimage).should.match(shop.coverimage);
                                                (shopsres.promoteimage).should.match(shop.promoteimage);
                                                (shopsres.items.length).should.match(1);
                                                (shopsres.items[0].products.length).should.match(30);
                                                (shopsres.items[0].products[0].name).should.match('sadf');
                                                (shopsres.items[0].products[1].name).should.match('sadf2');
                                                (shopsres.items[0].products[2].name).should.match('');
                                                var itemsupdate = shopsres.items;
                                                itemsupdate[0].products[3] = shopsres.items[0].products[0];
                                                var itemtoupdate = {
                                                  items: itemsupdate
                                                };
                                                agent.put('/api/updateitems/' + shops._id)
                                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                  .send(itemtoupdate)
                                                  .expect(200)
                                                  .end(function (deleteproduct2Err, deleteproduct2Res) {
                                                    // Handle signin error
                                                    if (deleteproduct2Err) {
                                                      return done(deleteproduct2Err);
                                                    }

                                                    agent.get('/api/shopshome')
                                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                      .expect(200)
                                                      .end(function (shopresGetErr2, shopsresGetRes2) {
                                                        // Handle shop save error
                                                        if (shopresGetErr2) {
                                                          return done(shopresGetErr2);
                                                        }
                                                        // Get shop list
                                                        var shopsres2 = shopsresGetRes2.body;
                                                        (shopsres2.coverimage).should.match(shop.coverimage);
                                                        (shopsres2.promoteimage).should.match(shop.promoteimage);
                                                        (shopsres2.items.length).should.match(1);
                                                        (shopsres2.items[0].products.length).should.match(30);
                                                        (shopsres2.items[0].products[0].name).should.match('sadf');
                                                        (shopsres2.items[0].products[1].name).should.match('sadf2');
                                                        (shopsres2.items[0].products[2].name).should.match('');
                                                        (shopsres2.items[0].products[3].name).should.match('sadf');
                                                        done();
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
          });

      });
  });

  it('shop home condition promotionprice and isrecomment', function (done) {
    // Save a new Shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.put('/api/shops/createusershop/' + shopSaveRes.body._id)
          .expect(200)
          .end(function (createusershopErr, createusershopRes) {
            // Handle signin error
            if (createusershopErr) {
              return done(createusershopErr);
            }
            var newcredentials = {
              username: shop.email,
              password: 'user1234'
            };
            agent.post('/api/auth/signin')
              .send(newcredentials)
              .expect(200)
              .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                  return done(signinErr);
                }
                agent.get('/api/shopshome')
                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                  .expect(200)
                  .end(function (shopGetErr, shopsGetRes) {
                    if (shopGetErr) {
                      return done(shopGetErr);
                    }
                    var shops = shopsGetRes.body;
                    (shops.coverimage).should.match(shop.coverimage);
                    (shops.promoteimage).should.match(shop.promoteimage);
                    (shops.items.length).should.match(0);
                    var cate = {
                      name: 'catename',
                      image: 'url_image',
                    };
                    agent.put('/api/createcate/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(cate)
                      .expect(200)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        // (shopchange.message).should.match('Promote images is limited.');
                        (shopchange.coverimage).should.match(shop.coverimage);
                        (shopchange.promoteimage).should.match(shop.promoteimage);
                        (shopchange.items.length).should.match(1);
                        (shopchange.items[0].cate.name).should.match(cate.name);
                        (shopchange.items[0].products.length).should.match(30);

                        agent.get('/api/shops/' + shops._id)
                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                          .expect(200)
                          .end(function (shopxGetErr, shopsxGetRes) {
                            if (shopxGetErr) {
                              return done(shopxGetErr);
                            }
                            var shopsssxxx = shopsxGetRes.body;
                            (shopsssxxx.coverimage).should.match(shop.coverimage);
                            (shopsssxxx.promoteimage).should.match(shop.promoteimage);
                            (shopsssxxx.items.length).should.match(1);
                            (shopsssxxx.items[0].products.length).should.match(30);
                            // (shopsssxxx.items[0].products[0].name).should.match('sadf');
                            var productCreate = {
                              name: 'sadf',
                              images: ['asdf', 'asdf'],
                              price: 1234,
                              categories: shopchange.items[0].cate,
                              index: 0,
                              cateindex: 0
                            };
                            agent.put('/api/createproduct/' + shops._id)
                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                              .send(productCreate)
                              .expect(200)
                              .end(function (createproductErr, createproductRes) {
                                // Handle signin error
                                if (createproductErr) {
                                  return done(createproductErr);
                                }
                                var shopProduct = createproductRes.body;
                                (shopProduct.coverimage).should.match(shop.coverimage);
                                (shopProduct.promoteimage).should.match(shop.promoteimage);
                                (shopProduct.items.length).should.match(1);
                                (shopProduct.items[0].cate.name).should.match(cate.name);
                                (shopProduct.items[0].products.length).should.match(30);
                                var productCreate2 = {
                                  name: 'sadf2',
                                  images: ['asdf2', 'asdf'],
                                  price: 1234,
                                  categories: shopchange.items[0].cate,
                                  isrecommend: true,
                                  promotionprice: 900,
                                  startdate: new Date(),
                                  expiredate: new Date(),
                                  index: 1,
                                  cateindex: 0
                                };
                                agent.put('/api/createproduct/' + shops._id)
                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                  .send(productCreate2)
                                  .expect(200)
                                  .end(function (createproduct2Err, createproduct2Res) {
                                    // Handle signin error
                                    if (createproduct2Err) {
                                      return done(createproduct2Err);
                                    }
                                    var shopProduct2 = createproduct2Res.body;
                                    (shopProduct2.coverimage).should.match(shop.coverimage);
                                    (shopProduct2.promoteimage).should.match(shop.promoteimage);
                                    (shopProduct2.items.length).should.match(1);
                                    (shopProduct2.items[0].products.length).should.match(30);
                                    (shopProduct2.items[0].cate.name).should.match(cate.name);
                                    agent.get('/api/shops/' + shops._id)
                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                      .expect(200)
                                      .end(function (shopxGetErr, shopsxGetRes) {
                                        if (shopxGetErr) {
                                          return done(shopxGetErr);
                                        }
                                        var shopsssx = shopsxGetRes.body;
                                        (shopsssx.coverimage).should.match(shop.coverimage);
                                        (shopsssx.promoteimage).should.match(shop.promoteimage);
                                        (shopsssx.items.length).should.match(1);
                                        (shopsssx.items[0].products.length).should.match(30);
                                        (shopsssx.items[0].products[0].name).should.match('sadf');
                                        (shopsssx.items[0].products[1].name).should.match('sadf2');
                                        agent.get('/api/products')
                                          .expect(200)
                                          .end(function (productsGetErr, productsGetRes) {
                                            if (productsGetErr) {
                                              return done(productsGetErr);
                                            }
                                            var productsRes = productsGetRes.body;
                                            (productsRes.length).should.match(4);

                                            agent.get('/api/shopshome')
                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                              .expect(200)
                                              .end(function (shopresGetErr, shopsresGetRes) {
                                                // Handle shop save error
                                                if (shopresGetErr) {
                                                  return done(shopresGetErr);
                                                }
                                                // Get shop list
                                                var shopsres = shopsresGetRes.body;
                                                (shopsres.coverimage).should.match(shop.coverimage);
                                                (shopsres.promoteimage).should.match(shop.promoteimage);
                                                (shopsres.items.length).should.match(1);
                                                (shopsres.items[0].products.length).should.match(30);
                                                (shopsres.items[0].products[0].name).should.match('sadf');
                                                (shopsres.items[0].products[1].name).should.match('sadf2');
                                                (shopsres.items[0].products[1].isrecommend).should.match(true);
                                                (shopsres.items[0].products[1].ispromotionprice).should.match(true);
                                                (shopsres.items[0].products[1].price).should.match(900);
                                                (shopsres.items[0].products[2].name).should.match('');

                                                done();
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
  });

  it('get shop detail by customer', function (done) {
    // Save a new Shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.put('/api/shops/createusershop/' + shopSaveRes.body._id)
          .expect(200)
          .end(function (createusershopErr, createusershopRes) {
            // Handle signin error
            if (createusershopErr) {
              return done(createusershopErr);
            }
            var newcredentials = {
              username: shop.email,
              password: 'user1234'
            };
            agent.post('/api/auth/signin')
              .send(newcredentials)
              .expect(200)
              .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                  return done(signinErr);
                }
                agent.get('/api/shopshome')
                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                  .expect(200)
                  .end(function (shopGetErr, shopsGetRes) {
                    if (shopGetErr) {
                      return done(shopGetErr);
                    }
                    var shops = shopsGetRes.body;
                    (shops.coverimage).should.match(shop.coverimage);
                    (shops.promoteimage).should.match(shop.promoteimage);
                    (shops.items.length).should.match(0);
                    var cate = {
                      name: 'catename',
                      image: 'url_image',
                    };
                    agent.put('/api/createcate/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(cate)
                      .expect(200)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        // (shopchange.message).should.match('Promote images is limited.');
                        (shopchange.coverimage).should.match(shop.coverimage);
                        (shopchange.promoteimage).should.match(shop.promoteimage);
                        (shopchange.items.length).should.match(1);
                        (shopchange.items[0].cate.name).should.match(cate.name);
                        (shopchange.items[0].products.length).should.match(30);

                        agent.get('/api/shops/' + shops._id)
                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                          .expect(200)
                          .end(function (shopxGetErr, shopsxGetRes) {
                            if (shopxGetErr) {
                              return done(shopxGetErr);
                            }
                            var shopsssxxx = shopsxGetRes.body;
                            (shopsssxxx.coverimage).should.match(shop.coverimage);
                            (shopsssxxx.promoteimage).should.match(shop.promoteimage);
                            (shopsssxxx.items.length).should.match(1);
                            (shopsssxxx.items[0].products.length).should.match(30);
                            // (shopsssxxx.items[0].products[0].name).should.match('sadf');
                            var productCreateFalse = {
                              name: '1222',
                              images: ['1222', '1222'],
                              price: 12222234,
                              categories: shopchange.items[0].cate,
                              issale: false,
                              index: 3,
                              cateindex: 0
                            };
                            agent.put('/api/createproduct/' + shops._id)
                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                              .send(productCreateFalse)
                              .expect(200)
                              .end(function (createproductErrfalse, createproductResfalse) {
                                // Handle signin error
                                if (createproductErrfalse) {
                                  return done(createproductErrfalse);
                                }
                            var productCreate = {
                              name: '1',
                              images: ['asdf', 'asdf'],
                              price: 1234,
                              categories: shopchange.items[0].cate,
                              index: 2,
                              cateindex: 0
                            };
                            agent.put('/api/createproduct/' + shops._id)
                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                              .send(productCreate)
                              .expect(200)
                              .end(function (createproductErr, createproductRes) {
                                // Handle signin error
                                if (createproductErr) {
                                  return done(createproductErr);
                                }
                                var shopProduct = createproductRes.body;
                                (shopProduct.coverimage).should.match(shop.coverimage);
                                (shopProduct.promoteimage).should.match(shop.promoteimage);
                                (shopProduct.items.length).should.match(1);
                                (shopProduct.items[0].cate.name).should.match(cate.name);
                                (shopProduct.items[0].products.length).should.match(30);
                                var productCreate2 = {
                                  name: '2',
                                  images: ['asdf2', 'asdf'],
                                  price: 1234,
                                  categories: shopchange.items[0].cate,
                                  isrecomment: true,
                                  ispromotionprice: true,
                                  promotionprice: 900,
                                  startdate: new Date(),
                                  expiredate: new Date(),
                                  index: 0,
                                  cateindex: 0
                                };
                                agent.put('/api/createproduct/' + shops._id)
                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                  .send(productCreate2)
                                  .expect(200)
                                  .end(function (createproduct2Err, createproduct2Res) {
                                    // Handle signin error
                                    if (createproduct2Err) {
                                      return done(createproduct2Err);
                                    }
                                    var shopProduct2 = createproduct2Res.body;
                                    (shopProduct2.coverimage).should.match(shop.coverimage);
                                    (shopProduct2.promoteimage).should.match(shop.promoteimage);
                                    (shopProduct2.items.length).should.match(1);
                                    (shopProduct2.items[0].products.length).should.match(30);
                                    (shopProduct2.items[0].cate.name).should.match(cate.name);
                                    agent.get('/api/shops/' + shops._id)
                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                      .expect(200)
                                      .end(function (shopxGetErr, shopsxGetRes) {
                                        if (shopxGetErr) {
                                          return done(shopxGetErr);
                                        }
                                        var shopsssx = shopsxGetRes.body;
                                        (shopsssx.coverimage).should.match(shop.coverimage);
                                        (shopsssx.promoteimage).should.match(shop.promoteimage);
                                        (shopsssx.items.length).should.match(1);
                                        (shopsssx.items[0].products.length).should.match(30);
                                        (shopsssx.items[0].products[0].name).should.match('2');
                                        (shopsssx.items[0].products[2].name).should.match('1');
                                        agent.get('/api/products')
                                          .expect(200)
                                          .end(function (productsGetErr, productsGetRes) {
                                            if (productsGetErr) {
                                              return done(productsGetErr);
                                            }
                                            var productsRes = productsGetRes.body;
                                            (productsRes.length).should.match(5);

                                            agent.get('/api/customershopdetail/' + shops._id)
                                              .expect(200)
                                              .end(function (shopresGetErr, shopsresGetRes) {
                                                // Handle shop save error
                                                if (shopresGetErr) {
                                                  return done(shopresGetErr);
                                                }
                                                // Get shop list
                                                var shopsres = shopsresGetRes.body;
                                                (shopsres._id).should.match(shopSaveRes.body._id);
                                                (shopsres.name).should.match(shop.name);
                                                (shopsres.detail).should.match(shop.detail);
                                                (shopsres.isopen).should.match(true);
                                                (shopsres.address.addressdetail).should.match(shop.address.addressdetail);
                                                (shopsres.coverimage).should.match(shop.coverimage);
                                                (shopsres.promoteimage).should.match(shop.promoteimage);
                                                (shopsres.times).should.match(shop.times);
                                                (shopsres.categories.length).should.match(1);
                                                (shopsres.categories[0]._id).should.match(shopchange.items[0].cate._id);
                                                (shopsres.categories[0].name).should.match(shopchange.items[0].cate.name);
                                                (shopsres.categories[0].image).should.match(shopchange.items[0].cate.image);
                                                (shopsres.products.length).should.match(2);

                                                (shopsres.products[0]._id).should.match(shopsssx.items[0].products[0]._id);
                                                (shopsres.products[0].cateid).should.match(shopchange.items[0].cate._id);
                                                (shopsres.products[0].name).should.match(shopsssx.items[0].products[0].name);
                                                // (shopsres.products[1].name).should.match('1');
                                                (shopsres.products[0].image).should.match('asdf2');
                                                (shopsres.products[0].price).should.match(900);
                                                (shopsres.products[0].ispromotion).should.match(true);
                                                (shopsres.products[0].popularcount).should.match(0);
                                                (shopsres.products[0].isrecommend).should.match(false);

                                                (shopsres.products[1]._id).should.match(shopsssx.items[0].products[2]._id);
                                                (shopsres.products[1].cateid).should.match(shopchange.items[0].cate._id);
                                                (shopsres.products[1].name).should.match(shopsssx.items[0].products[2].name);
                                                // (shopsres.products[0].name).should.match('2');
                                                (shopsres.products[1].image).should.match('asdf');
                                                (shopsres.products[1].price).should.match(shopsssx.items[0].products[2].price);
                                                (shopsres.products[1].ispromotion).should.match(false);
                                                (shopsres.products[1].popularcount).should.match(0);
                                                (shopsres.products[1].isrecommend).should.match(false);


                                                done();
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

      });
  });

  it('get list shops', function (done) {
    // Save a new Shop

    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.get('/api/getshoplist')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            var shops = shopsGetRes.body;

            (shops.length).should.match(1);
            (shops[0].coverimage).should.match(shop.coverimage);

            done();
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Categoryshop.remove().exec(function () {
        Categoryproduct.remove().exec(function () {
          Product.remove().exec(function () {
            Shop.remove().exec(done);
          });
        });
      });
    });
  });
});
