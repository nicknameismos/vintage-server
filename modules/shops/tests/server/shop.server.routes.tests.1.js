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
describe('Shop CRUD token tests', function () {

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

  it('should be able to save a Shop if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle Product save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        // Get a list of Products
        agent.get('/api/shops')
          .end(function (shopsGetErr, shopsGetRes) {
            // Handle Products save error
            if (shopsGetErr) {
              return done(shopsGetErr);
            }

            // Get Products list
            var shops = shopsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (shops[0].name).should.match(shop.name);
            // (shops[0]).should.match(1);     


            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get List a Shop if logged in with token', function (done) {
    // Save a new Shops
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle Shops save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        // Get a list of shops
        agent.get('/api/shops')
          .end(function (shopsGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopsGetErr) {
              return done(shopsGetErr);
            }

            // Get shops list
            var shops = shopsGetRes.body;

            // Set assertions
            // (shops).should.match('');

            (shops[0].name).should.match(shop.name);

            // (shops[0].tel).should.match(shop.tel);
            // (shops[0].address).should.match(shop.address);
            // (shops[0].importform).should.match(shop.importform);



            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get By ID a Shop if logged in with token', function (done) {
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
        agent.get('/api/shops/' + shopSaveRes.body._id)
          // .send(shop)
          // .expect(200)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            // console.log(JSON.stringify(shopsGetRes.body));
            var shops = shopsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            shops.should.be.instanceof(Object).and.have.property('name', shop.name);

            done();
          });
      });
  });

  it('should be able to update a Shop if logged in with token', function (done) {
    // Save a new shops
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        shop.name = "test Shop";
        agent.put('/api/shops/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shop)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get shop list
                var shops = shopsGetRes.body;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                (shops[0].name).should.match('test Shop');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to delete a Shop if logged in with token', function (done) {
    // Save a new shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        agent.delete('/api/shops/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shop)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get shop list
                var shops = shopsGetRes.body;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                (shops.length).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('is active shop generate user shop with token', function (done) {
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        // shop.isactiveshop = true;
        agent.put('/api/shops/createusershop/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shop)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get shop list
                // console.log('new user by shop'+ JSON.stringify(shopsGetRes.body));
                var shops = shopsGetRes.body;

                // Set assertions
                (shops.length).should.match(1);
                (shops[0].issendmail).should.match(true);
                (shops[0].isactiveshop).should.match(true);
                // (shops[0].user.firstName).should.match(shop.name);
                (shops[0].shopowner.firstName).should.match('ครัวคุณโก๋');


                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('get category filter', function (done) {

    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        // Get a list of shops
        agent.get('/api/shops/categories')
          .end(function (shopsGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopsGetErr) {
              return done(shopsGetErr);
            }

            // Get shops list
            var shops = shopsGetRes.body;

            // Set assertions

            (shops.filtercate[0].name).should.match('รายการร้านค้า');
            (shops.filtercate[0].items.length).should.match(1);
            (shops.filtercate[1].name).should.match('ร้านค้าใหม่');
            (shops.filtercate[1].items.length).should.match(1);
            (shops.filtercate[2].name).should.match('official');
            (shops.filtercate[2].items.length).should.match(0);
            (shops.filtercate[3].name).should.match('ร้านฝากซื้อ');
            (shops.filtercate[3].items.length).should.match(0);


            // Call the assertion callback
            done();
          });
      });
  });

  it('add promote image shop more 10 pic', function (done) {
    // Save a new Shop
    shop.promoteimage = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
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
                    var datapromote = {
                      data: 'image_url'
                    };
                    agent.put('/api/addpromote/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(datapromote)
                      .expect(400)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        (shopchange.message).should.match('Promote images is limited.');
                        done();
                      });
                  });
              });
          });

      });
  });

  it('get shop home with token no data', function (done) {
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
        agent.get('/api/shopshome')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            var shops = shopsGetRes.body;

            // Set assertions
            // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
            // coverimage: 'https://img.wongnai.com/p/l/2016/11/29/15ff08373d31409fb2f80ebf4623589a.jpg',
            // promoteimage:
            (shops.coverimage).should.match(shop.coverimage);
            (shops.promoteimage).should.match(shop.promoteimage);
            (shops.items.length).should.match(0);

            done();
          });
      });
  });

  // it('shop create cate', function (done) {
  //   // Save a new Shop
  //   shop.promoteimage = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  //   agent.post('/api/shops')
  //     .set('authorization', 'Bearer ' + token)
  //     .send(shop)
  //     .expect(200)
  //     .end(function (shopSaveErr, shopSaveRes) {
  //       // Handle shop save error
  //       if (shopSaveErr) {
  //         return done(shopSaveErr);
  //       }
  //       agent.put('/api/shops/createusershop/' + shopSaveRes.body._id)
  //         .expect(200)
  //         .end(function (createusershopErr, createusershopRes) {
  //           // Handle signin error
  //           if (createusershopErr) {
  //             return done(createusershopErr);
  //           }
  //           var newcredentials = {
  //             username: shop.email,
  //             password: 'user1234'
  //           };
  //           agent.post('/api/auth/signin')
  //             .send(newcredentials)
  //             .expect(200)
  //             .end(function (signinErr, signinRes) {
  //               // Handle signin error
  //               if (signinErr) {
  //                 return done(signinErr);
  //               }
  //               agent.get('/api/shopshome')
  //                 .set('authorization', 'Bearer ' + signinRes.body.loginToken)
  //                 .expect(200)
  //                 .end(function (shopGetErr, shopsGetRes) {
  //                   if (shopGetErr) {
  //                     return done(shopGetErr);
  //                   }
  //                   var shops = shopsGetRes.body;
  //                   (shops.coverimage).should.match(shop.coverimage);
  //                   (shops.promoteimage).should.match(shop.promoteimage);
  //                   (shops.items.length).should.match(0);
  //                   var cate = {
  //                     name: 'catename',
  //                     image: 'url_image',
  //                   };
  //                   agent.put('/api/createcate/' + shops._id)
  //                     .set('authorization', 'Bearer ' + signinRes.body.loginToken)
  //                     .send(cate)
  //                     .expect(200)
  //                     .end(function (changecoverErr, changecoverRes) {
  //                       // Handle signin error
  //                       if (changecoverErr) {
  //                         return done(changecoverErr);
  //                       }
  //                       var shopchange = changecoverRes.body;
  //                       // (shopchange.message).should.match('Promote images is limited.');
  //                       (shopchange.coverimage).should.match(shop.coverimage);
  //                       (shopchange.promoteimage).should.match(shop.promoteimage);
  //                       (shopchange.items.length).should.match(1);
  //                       (shopchange.items[0].cate.name).should.match(cate.name);
  //                       (shopchange.items[0].products.length).should.match(30);
  //                       (shopchange.items[0].products[0].name).should.match('');
  //                       done();
  //                     });
  //                 });
  //             });
  //         });

  //     });
  // });

  it('shop create product', function (done) {
    // Save a new Shop
    shop.promoteimage = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
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

  it('get shop home with token', function (done) {
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

  it('change cover shop', function (done) {
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
                    var datacorver = {
                      data: 'image_url'
                    };
                    agent.put('/api/changecover/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(datacorver)
                      .expect(200)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        (shopchange.coverimage).should.match(datacorver.data);
                        (shopchange.promoteimage).should.match(shop.promoteimage);
                        done();
                      });
                  });
              });
          });

      });
  });

  it('add promote image shop', function (done) {
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
                    var datapromote = {
                      data: 'image_url'
                    };
                    agent.put('/api/addpromote/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(datapromote)
                      .expect(200)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        (shopchange.coverimage).should.match(shop.coverimage);
                        (shopchange.promoteimage.length).should.match(6);
                        (shopchange.items.length).should.match(0);
                        done();
                      });
                  });
              });
          });

      });
  });

  it('add promote image shop more 10 pic', function (done) {
    // Save a new Shop
    shop.promoteimage = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
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
                    var datapromote = {
                      data: 'image_url'
                    };
                    agent.put('/api/addpromote/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(datapromote)
                      .expect(400)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        (shopchange.message).should.match('Promote images is limited.');
                        done();
                      });
                  });
              });
          });

      });
  });

  it('manage shop info', function (done) {
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
                    var firstlogin = {
                      profileImageURL: 'mypic.jpg',
                      firstName: 'my name is',
                      lastName: 'my lastname is',
                      dateOfBirth: new Date(),
                      citizenid: '12150',
                      bankaccount: '1122233',
                      coverimage: 'http://www.hardrock.com/cafes/amsterdam/files/2308/LegendsRoom.jpg',
                      name: 'ครัวคุณโก๋2',
                      name_eng: 'Shop name english2',
                      detail: 'Coffice Idea Space2',
                      email: 'test2@gmail.com',
                      facebook: 'facebook2.com',
                      line: '@lineid2',
                      times: [{
                        description: 'ทุกวัน2',
                        timestart: '07.02',
                        timeend: '20.02',
                        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                      }],
                      address: {
                        address: '88/82',
                        addressdetail: 'ตรงข้าม big c2',
                        subdistinct: 'ลำลูกกา2',
                        distinct: 'ลำลูกกา2',
                        province: 'ปทุมธานี2',
                        postcode: '121502',
                        lat: '13.93389492',
                        lng: '100.68277732'
                      }

                    };
                    agent.put('/api/manageshopinfo/')
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(firstlogin)
                      .expect(200)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        (shopchange.shop.coverimage).should.match(firstlogin.coverimage);
                        (shopchange.shop.name).should.match(firstlogin.name);
                        (shopchange.shop.name_eng).should.match(firstlogin.name_eng);
                        (shopchange.shop.detail).should.match(firstlogin.detail);
                        (shopchange.shop.email).should.match(firstlogin.email);
                        (shopchange.shop.facebook).should.match(firstlogin.facebook);
                        (shopchange.shop.line).should.match(firstlogin.line);
                        (shopchange.shop.times.length).should.match(1);
                        (shopchange.shop.times[0].description).should.match(firstlogin.times[0].description);
                        (shopchange.shop.times[0].timestart).should.match(firstlogin.times[0].timestart);
                        (shopchange.shop.times[0].timeend).should.match(firstlogin.times[0].timeend);
                        (shopchange.shop.times[0].days.length).should.match(7);
                        (shopchange.shop.times[0].days[0]).should.match(firstlogin.times[0].days[0]);
                        (shopchange.shop.times[0].days[6]).should.match(firstlogin.times[0].days[6]);
                        (shopchange.shop.address.address).should.match(firstlogin.address.address);
                        (shopchange.shop.address.addressdetail).should.match(firstlogin.address.addressdetail);
                        (shopchange.shop.address.subdistinct).should.match(firstlogin.address.subdistinct);
                        (shopchange.shop.address.distinct).should.match(firstlogin.address.distinct);
                        (shopchange.shop.address.province).should.match(firstlogin.address.province);
                        (shopchange.shop.address.postcode).should.match(firstlogin.address.postcode);
                        (shopchange.shop.address.lat).should.match(firstlogin.address.lat);
                        (shopchange.shop.address.lng).should.match(firstlogin.address.lng);
                        (shopchange.user.profileImageURL).should.match(firstlogin.profileImageURL);
                        (shopchange.user.firstName).should.match(firstlogin.firstName);
                        (shopchange.user.lastName).should.match(firstlogin.lastName);
                        (shopchange.user.dateOfBirth).should.match(firstlogin.dateOfBirth);
                        (shopchange.user.citizenid).should.match(firstlogin.citizenid);
                        (shopchange.user.bankaccount).should.match(firstlogin.bankaccount);
                        (shopchange.shop.promoteimage.length).should.match(5);
                        (shopchange.shop.items.length).should.match(0);
                        done();
                      });
                  });
              });
          });

      });
  });

  it('get home admin', function (done) {
    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        agent.get('/api/adminhome')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            var shops = shopsGetRes.body;

            // Set assertions
            // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
            (shops.name.length).should.match(4);
            (shops.name[0]).should.match('รายการร้านค้า');
            (shops.pagings.length).should.match(2);
            (shops.pagings[0]).should.match(1);
            (shops.pagings[1]).should.match(2);
            (shops.items.length).should.match(10);
            (shops.items[0].name).should.match('shop01');
            (shops.items[9].name).should.match('shop10');

            done();
          });
      });
  });

  it('filter current page no keyword', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'รายการร้านค้า',
      currentpage: null,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(10);

        done();
      });
  });

  it('filter current page no keyword page 2', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'รายการร้านค้า',
      currentpage: 2,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(2);

        done();
      });
  });

  it('filter current page new created no keyword ', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop10.created = new Date(2017, 11, 14);
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();


    var data = {
      typename: 'ร้านค้าใหม่',
      currentpage: null,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(10);
        (shops.items[9].name).should.match('shop10');
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('filter current page official no keyword ', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';
    shop1.issendmail = true;
    shop2.issendmail = true;
    shop3.issendmail = true;
    shop4.issendmail = true;
    shop5.issendmail = true;
    shop6.issendmail = true;
    shop7.issendmail = true;
    shop8.issendmail = true;



    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();


    var data = {
      typename: 'official',
      currentpage: null,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(8);
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('filter current page unofficial no keyword ', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';




    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();


    var data = {
      typename: 'ร้านฝากซื้อ',
      currentpage: null,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(10);
        (shops.pagings.length).should.match(1);


        done();
      });
  });

  it('filter current page keyword page1', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'รายการร้านค้า',
      currentpage: null,
      keyword: 's'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(10);
        (shops.pagings.length).should.match(2);

        done();
      });
  });

  it('filter current page keyword page2', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'รายการร้านค้า',
      currentpage: 2,
      keyword: 's'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(2);
        (shops.pagings.length).should.match(2);

        done();
      });
  });

  it('filter current page new created keyword page1', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop1.created = new Date(2017, 11, 14);
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'ร้านค้าใหม่',
      currentpage: null,
      keyword: 'shop0'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(9);
        (shops.items[8].name).should.match('shop01');
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('filter current page official keyword page1', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';
    shop12.issendmail = true;

    shop1.issendmail = true;
    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'official',
      currentpage: null,
      keyword: 'shop0'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(1);
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('filter current page unofficial keyword page1', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'ร้านฝากซื้อ',
      currentpage: null,
      keyword: 'shop0'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(9);
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('add data real', function (done) {
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
                      name: 'ของทานเล่น',
                      image: 'https://i.pinimg.com/736x/a1/b6/2e/a1b62e13c959f4ede0f450605c67ed33--thai-dessert-thaifood.jpg',
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

                        var productCreate1 = {
                          name: 'ขนมปังชีสโรล',
                          images: ['https://img.kapook.com/u/2016/surauch/cook1/appetizer4.jpg'],
                          price: 200,
                          categories: shopchange.items[0].cate,
                          index: 0,
                          cateindex: 0
                        };
                        agent.put('/api/createproduct/' + shops._id)
                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                          .send(productCreate1)
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
                              name: 'ขนมปังอบชีส',
                              images: ['https://img.kapook.com/u/2016/surauch/cook1/appetizer10.jpg'],
                              price: 200,
                              categories: shopchange.items[0].cate,
                              index: 1,
                              cateindex: 0
                            };
                            agent.put('/api/createproduct/' + shops._id)
                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                              .send(productCreate2)
                              .expect(200)
                              .end(function (create2productErr, create2productRes) {
                                // Handle signin error
                                if (create2productErr) {
                                  return done(create2productErr);
                                }
                                var shopProduct2 = create2productRes.body;
                                (shopProduct2.coverimage).should.match(shop.coverimage);
                                (shopProduct2.promoteimage).should.match(shop.promoteimage);
                                (shopProduct2.items.length).should.match(1);
                                (shopProduct2.items[0].cate.name).should.match(cate.name);
                                (shopProduct2.items[0].products.length).should.match(30);

                                var cate2 = {
                                  name: 'ของหวาน',
                                  image: 'http://ed.files-media.com/ud/book/content/1/147/439909/IMG_5070_Cover-620x392-850x567.jpg',
                                };
                                agent.put('/api/createcate/' + shops._id)
                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                  .send(cate2)
                                  .expect(200)
                                  .end(function (changecover2Err, changecover2Res) {
                                    // Handle signin error
                                    if (changecover2Err) {
                                      return done(changecover2Err);
                                    }
                                    var shop2change = changecover2Res.body;
                                    // (shopchange.message).should.match('Promote images is limited.');
                                    (shop2change.coverimage).should.match(shop.coverimage);
                                    (shop2change.promoteimage).should.match(shop.promoteimage);
                                    (shop2change.items.length).should.match(2);



                                    var productCreate3 = {
                                      name: 'ฮันนี่โทสต์มะม่วง',
                                      images: ['https://img.kapook.com/u/2016/surauch/cook1/b1_3.jpg'],
                                      price: 200,
                                      categories: shop2change.items[1].cate,
                                      index: 0,
                                      cateindex: 1
                                    };
                                    agent.put('/api/createproduct/' + shops._id)
                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                      .send(productCreate3)
                                      .expect(200)
                                      .end(function (create3productErr, create3productRes) {
                                        // Handle signin error
                                        if (create3productErr) {
                                          return done(create3productErr);
                                        }
                                        var shopProduct3 = create3productRes.body;
                                        (shopProduct3.coverimage).should.match(shop.coverimage);
                                        (shopProduct3.promoteimage).should.match(shop.promoteimage);
                                        (shopProduct3.items.length).should.match(2);
                                        (shopProduct3.items[1].cate.name).should.match(cate2.name);
                                        (shopProduct3.items[1].products.length).should.match(30);

                                        var productCreate4 = {
                                          name: 'ช็อกโกแลตลาวา',
                                          images: ['https://img.kapook.com/u/2016/surauch/cook1/b7_1.jpg'],
                                          price: 200,
                                          categories: shop2change.items[1].cate,
                                          index: 1,
                                          cateindex: 1
                                        };
                                        agent.put('/api/createproduct/' + shops._id)
                                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                          .send(productCreate4)
                                          .expect(200)
                                          .end(function (create4productErr, create4productRes) {
                                            // Handle signin error
                                            if (create4productErr) {
                                              return done(create4productErr);
                                            }

                                            var productCreate5 = {
                                              name: 'ชีสพายชาเขียว',
                                              images: ['https://img.kapook.com/u/2016/surauch/cook1/b13_1.jpg'],
                                              price: 200,
                                              categories: shop2change.items[1].cate,
                                              index: 2,
                                              cateindex: 1
                                            };
                                            agent.put('/api/createproduct/' + shops._id)
                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                              .send(productCreate5)
                                              .expect(200)
                                              .end(function (create5productErr, create5productRes) {
                                                // Handle signin error
                                                if (create5productErr) {
                                                  return done(create5productErr);
                                                }

                                                var productCreate6 = {
                                                  name: 'เครปช็อกโกแลต',
                                                  images: ['https://img.kapook.com/u/2016/surauch/cook1/b17_1.jpg'],
                                                  price: 200,
                                                  categories: shop2change.items[1].cate,
                                                  index: 3,
                                                  cateindex: 1
                                                };
                                                agent.put('/api/createproduct/' + shops._id)
                                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                  .send(productCreate6)
                                                  .expect(200)
                                                  .end(function (create6productErr, create6productRes) {
                                                    // Handle signin error
                                                    if (create6productErr) {
                                                      return done(create6productErr);
                                                    }


                                                    var productCreate7 = {
                                                      name: 'เครปข้าวเหนียวมะม่วง',
                                                      images: ['https://img.kapook.com/u/2016/surauch/cook1/b19_1.jpg'],
                                                      price: 200,
                                                      categories: shop2change.items[1].cate,
                                                      index: 4,
                                                      cateindex: 1
                                                    };
                                                    agent.put('/api/createproduct/' + shops._id)
                                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                      .send(productCreate7)
                                                      .expect(200)
                                                      .end(function (create7productErr, create7productRes) {
                                                        // Handle signin error
                                                        if (create7productErr) {
                                                          return done(create7productErr);
                                                        }


                                                        var cate3 = {
                                                          name: 'เมนูทะเล',
                                                          image: 'http://www.chillpainai.com/src/wewakeup/scoop/img_scoop/scoop/kang/travel/5cfooddelivery/sfff.jpg',
                                                        };
                                                        agent.put('/api/createcate/' + shops._id)
                                                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                          .send(cate3)
                                                          .expect(200)
                                                          .end(function (cate3Err, cate3Res) {
                                                            // Handle signin error
                                                            if (cate3Err) {
                                                              return done(cate3Err);
                                                            }

                                                            var cate3res = cate3Res.body;

                                                            var productCreate8 = {
                                                              name: 'กุ้งมะนาว',
                                                              images: ['https://img.kapook.com/u/2016/surauch/cook1/c3_2.jpg'],
                                                              price: 200,
                                                              categories: cate3res.items[2].cate,
                                                              index: 0,
                                                              cateindex: 2
                                                            };
                                                            agent.put('/api/createproduct/' + shops._id)
                                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                              .send(productCreate8)
                                                              .expect(200)
                                                              .end(function (productCreate8Err, productCreate8Res) {
                                                                // Handle signin error
                                                                if (productCreate8Err) {
                                                                  return done(productCreate8Err);
                                                                }

                                                                var productCreate9 = {
                                                                  name: 'ปลาหมึกผัดฉ่า',
                                                                  images: ['https://img.kapook.com/u/2016/surauch/cook1/c12_2.jpg'],
                                                                  price: 200,
                                                                  categories: cate3res.items[2].cate,
                                                                  index: 1,
                                                                  cateindex: 2
                                                                };
                                                                agent.put('/api/createproduct/' + shops._id)
                                                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                  .send(productCreate9)
                                                                  .expect(200)
                                                                  .end(function (productCreate9Err, productCreate9Res) {
                                                                    // Handle signin error
                                                                    if (productCreate9Err) {
                                                                      return done(productCreate9Err);
                                                                    }

                                                                    var productCreate10 = {
                                                                      name: 'ปลาหมึกนึ่งมะนาว',
                                                                      images: ['https://img.kapook.com/u/2016/surauch/cook1/c13_1.jpg'],
                                                                      price: 200,
                                                                      categories: cate3res.items[2].cate,
                                                                      index: 2,
                                                                      cateindex: 2
                                                                    };
                                                                    agent.put('/api/createproduct/' + shops._id)
                                                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                      .send(productCreate10)
                                                                      .expect(200)
                                                                      .end(function (productCreate10Err, productCreate10Res) {
                                                                        // Handle signin error
                                                                        if (productCreate10Err) {
                                                                          return done(productCreate10Err);
                                                                        }

                                                                        var productCreate11 = {
                                                                          name: 'ปลาเก๋านึ่งมะนาว',
                                                                          images: ['https://img.kapook.com/u/2016/surauch/cook1/c15_1.jpg'],
                                                                          price: 200,
                                                                          categories: cate3res.items[2].cate,
                                                                          index: 3,
                                                                          cateindex: 2
                                                                        };
                                                                        agent.put('/api/createproduct/' + shops._id)
                                                                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                          .send(productCreate11)
                                                                          .expect(200)
                                                                          .end(function (productCreate11Err, productCreate11Res) {
                                                                            // Handle signin error
                                                                            if (productCreate11Err) {
                                                                              return done(productCreate11Err);
                                                                            }

                                                                            var productCreate12 = {
                                                                              name: 'ปลากะพงทอดน้ำปลา',
                                                                              images: ['https://img.kapook.com/u/2016/surauch/cook1/c16_2.jpg'],
                                                                              price: 200,
                                                                              categories: cate3res.items[2].cate,
                                                                              index: 4,
                                                                              cateindex: 2
                                                                            };
                                                                            agent.put('/api/createproduct/' + shops._id)
                                                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                              .send(productCreate12)
                                                                              .expect(200)
                                                                              .end(function (productCreate12Err, productCreate12Res) {
                                                                                // Handle signin error
                                                                                if (productCreate12Err) {
                                                                                  return done(productCreate12Err);
                                                                                }

                                                                                var cate4 = {
                                                                                  name: 'เมนูเส้น',
                                                                                  image: 'https://daily.rabbitstatic.com/wp-content/uploads/2017/09/5-6.jpg',
                                                                                };
                                                                                agent.put('/api/createcate/' + shops._id)
                                                                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                  .send(cate4)
                                                                                  .expect(200)
                                                                                  .end(function (cate4Err, cate4Res) {
                                                                                    // Handle signin error
                                                                                    if (cate4Err) {
                                                                                      return done(cate4Err);
                                                                                    }
                                                                                    // 3
                                                                                    var cate4res = cate4Res.body;

                                                                                    var productCreate13 = {
                                                                                      name: 'เส้นหมี่กะทิสีชมพู',
                                                                                      images: ['https://img.kapook.com/u/2016/surauch/Mix/b3_3.jpg'],
                                                                                      price: 200,
                                                                                      categories: cate4res.items[3].cate,
                                                                                      index: 0,
                                                                                      cateindex: 3
                                                                                    };
                                                                                    agent.put('/api/createproduct/' + shops._id)
                                                                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                      .send(productCreate13)
                                                                                      .expect(200)
                                                                                      .end(function (productCreate13Err, productCreate13Res) {
                                                                                        // Handle signin error
                                                                                        if (productCreate13Err) {
                                                                                          return done(productCreate13Err);
                                                                                        }

                                                                                        var productCreate14 = {
                                                                                          name: 'บะหมี่กึ่งสำเร็จรูปผัดขี้เมา',
                                                                                          images: ['https://img.kapook.com/u/2016/surauch/Mix/b6_4.jpg'],
                                                                                          price: 200,
                                                                                          categories: cate4res.items[3].cate,
                                                                                          index: 1,
                                                                                          cateindex: 3
                                                                                        };
                                                                                        agent.put('/api/createproduct/' + shops._id)
                                                                                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                          .send(productCreate14)
                                                                                          .expect(200)
                                                                                          .end(function (productCreate14Err, productCreate14Res) {
                                                                                            // Handle signin error
                                                                                            if (productCreate14Err) {
                                                                                              return done(productCreate14Err);
                                                                                            }


                                                                                            var productCreate15 = {
                                                                                              name: 'ผัดซีอิ๊วเส้นใหญ่กุ้งใส่ไก่',
                                                                                              images: ['https://img.kapook.com/u/2016/surauch/cook1/b8_1.jpg'],
                                                                                              price: 200,
                                                                                              categories: cate4res.items[3].cate,
                                                                                              index: 2,
                                                                                              cateindex: 3
                                                                                            };
                                                                                            agent.put('/api/createproduct/' + shops._id)
                                                                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                              .send(productCreate15)
                                                                                              .expect(200)
                                                                                              .end(function (productCreate15Err, productCreate15Res) {
                                                                                                // Handle signin error
                                                                                                if (productCreate15Err) {
                                                                                                  return done(productCreate15Err);
                                                                                                }

                                                                                                var productCreate16 = {
                                                                                                  name: 'วุ้นเส้นผัดไทย',
                                                                                                  images: ['https://img.kapook.com/u/2016/surauch/cook1/b15.jpg'],
                                                                                                  price: 200,
                                                                                                  categories: cate4res.items[3].cate,
                                                                                                  index: 3,
                                                                                                  cateindex: 3
                                                                                                };
                                                                                                agent.put('/api/createproduct/' + shops._id)
                                                                                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                                  .send(productCreate16)
                                                                                                  .expect(200)
                                                                                                  .end(function (productCreate16Err, productCreate16Res) {
                                                                                                    // Handle signin error
                                                                                                    if (productCreate16Err) {
                                                                                                      return done(productCreate16Err);
                                                                                                    }

                                                                                                    var cate5 = {
                                                                                                      name: 'เมนูร้อน',
                                                                                                      image: 'https://daily.rabbitstatic.com/wp-content/uploads/2017/05/%E0%B8%95%E0%B9%89%E0%B8%A1%E0%B8%88%E0%B8%B7%E0%B8%94-7.jpg',
                                                                                                    };
                                                                                                    agent.put('/api/createcate/' + shops._id)
                                                                                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                                      .send(cate5)
                                                                                                      .expect(200)
                                                                                                      .end(function (cate5Err, cate5Res) {
                                                                                                        // Handle signin error
                                                                                                        if (cate5Err) {
                                                                                                          return done(cate5Err);
                                                                                                        }
                                                                                                        // 4
                                                                                                        var cate5res = cate5Res.body;

                                                                                                        var productCreate17 = {
                                                                                                          name: 'ต้มยำปลาทู',
                                                                                                          images: ['http://cookingdiary.fanthai.com/files/2013/11/mackerel-soup.jpg'],
                                                                                                          price: 200,
                                                                                                          categories: cate5res.items[4].cate,
                                                                                                          index: 0,
                                                                                                          cateindex: 4
                                                                                                        };
                                                                                                        agent.put('/api/createproduct/' + shops._id)
                                                                                                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                                          .send(productCreate17)
                                                                                                          .expect(200)
                                                                                                          .end(function (productCreate17Err, productCreate17Res) {
                                                                                                            // Handle signin error
                                                                                                            if (productCreate17Err) {
                                                                                                              return done(productCreate17Err);
                                                                                                            }

                                                                                                            var productCreate18 = {
                                                                                                              name: 'ต้มยำกุ้ง',
                                                                                                              images: ['https://img.kapook.com/u/2016/surauch/cook1/c2_5.jpg'],
                                                                                                              price: 200,
                                                                                                              categories: cate5res.items[4].cate,
                                                                                                              index: 1,
                                                                                                              cateindex: 4
                                                                                                            };
                                                                                                            agent.put('/api/createproduct/' + shops._id)
                                                                                                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                                              .send(productCreate18)
                                                                                                              .expect(200)
                                                                                                              .end(function (productCreate18Err, productCreate18Res) {
                                                                                                                // Handle signin error
                                                                                                                if (productCreate18Err) {
                                                                                                                  return done(productCreate18Err);
                                                                                                                }

                                                                                                                var productCreate19 = {
                                                                                                                  name: 'ขาไก่ต้มพะโล้',
                                                                                                                  images: ['https://img.kapook.com/u/2016/surauch/cook1/r10.jpg'],
                                                                                                                  price: 200,
                                                                                                                  categories: cate5res.items[4].cate,
                                                                                                                  index: 2,
                                                                                                                  cateindex: 4
                                                                                                                };
                                                                                                                agent.put('/api/createproduct/' + shops._id)
                                                                                                                  .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                                                  .send(productCreate19)
                                                                                                                  .expect(200)
                                                                                                                  .end(function (productCreate19Err, productCreate19Res) {
                                                                                                                    // Handle signin error
                                                                                                                    if (productCreate19Err) {
                                                                                                                      return done(productCreate19Err);
                                                                                                                    }

                                                                                                                    var productCreate20 = {
                                                                                                                      name: 'ต้มแซ่บไก่',
                                                                                                                      images: ['https://img.kapook.com/u/2017/surauch/cooking/w6_6.jpg'],
                                                                                                                      price: 200,
                                                                                                                      categories: cate5res.items[4].cate,
                                                                                                                      index: 3,
                                                                                                                      cateindex: 4
                                                                                                                    };
                                                                                                                    agent.put('/api/createproduct/' + shops._id)
                                                                                                                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                                                                                                                      .send(productCreate20)
                                                                                                                      .expect(200)
                                                                                                                      .end(function (productCreate20Err, productCreate20Res) {
                                                                                                                        // Handle signin error
                                                                                                                        if (productCreate20Err) {
                                                                                                                          return done(productCreate20Err);
                                                                                                                        }


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
                                                                                                                            (shopsres.isopen).should.match(true);
                                                                                                                            (shopsres.items.length).should.match(5);
                                                                                                                            (shopsres.items[0].products.length).should.match(30);
                                                                                                                            (shopsres.items[0].products[0].name).should.match(productCreate1.name);
                                                                                                                            (shopsres.items[0].products[1].name).should.match(productCreate2.name);
                                                                                                                            (shopsres.items[0].products[2].name).should.match('');
                                                                                                                            (shopsres.items[1].products.length).should.match(30);
                                                                                                                            (shopsres.items[1].products[4].name).should.match(productCreate7.name);
                                                                                                                            (shopsres.items[2].products.length).should.match(30);
                                                                                                                            (shopsres.items[2].products[4].name).should.match(productCreate12.name);
                                                                                                                            (shopsres.items[3].products.length).should.match(30);
                                                                                                                            (shopsres.items[3].products[3].name).should.match(productCreate16.name);
                                                                                                                            (shopsres.items[4].products.length).should.match(30);
                                                                                                                            (shopsres.items[4].products[3].name).should.match(productCreate20.name);



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

  it('shop edit own shop', function (done) {
    // Save a new Shop
    shop.promoteimage = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
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
                    (shops.name).should.match(shop.name);
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
                        (shopchange.items[0].products[0].name).should.match('');
                        agent.get('/api/shops/' + shops._id)
                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                          .expect(200)
                          .end(function (shopsByIdErr, shopsByIdRes) {
                            // Handle signin error
                            if (shopsByIdErr) {
                              return done(shopsByIdErr);
                            }
                            var shopsById = shopsByIdRes.body;
                            // categories
                            // categoryshop = new Categoryshop({
                            //   name: 'อาหารและเคื่องดื่ม'
                            // });
                            (shopsById.categories[0].name).should.match(categoryshop.name);
                            (shopsById.coverimage).should.match(shop.coverimage);
                            (shopsById.name).should.match(shop.name);
                            (shopsById.name_eng).should.match(shop.name_eng);
                            (shopsById.detail).should.match(shop.detail);
                            (shopsById.email).should.match(shop.email);
                            (shopsById.tel).should.match(shop.tel);
                            (shopsById.othercontact).should.match('');
                            (shopsById.times).should.match(shop.times);
                            (shopsById.address.address).should.match(shop.address.address);
                            (shopsById.address.addressdetail).should.match(shop.address.addressdetail);
                            (shopsById.address.subdistinct).should.match(shop.address.subdistinct);
                            (shopsById.address.distinct).should.match(shop.address.distinct);
                            (shopsById.address.province).should.match(shop.address.province);
                            (shopsById.address.postcode).should.match(shop.address.postcode);
                            (shopsById.address.lat).should.match(shop.address.lat);
                            (shopsById.address.lng).should.match(shop.address.lng);
                            (shopsById.items.length).should.match(1);
                            (shopsById.items[0].cate.name).should.match(cate.name);
                            (shopsById.items[0].products.length).should.match(30);
                            (shopsById.items[0].products[0].name).should.match('default');
                            var categoryshop2 = new Categoryshop({
                              name: 'ssss'
                            });
                            categoryshop2.save();
                            var editdatashop = {
                              categories: [categoryshop2],
                              name: 'ครัวคุณโก๋2',
                              name_eng: 'Shop name english2',
                              detail: 'Coffice Idea Space2',
                              tel: '08944472082',
                              email: 'test2@gmail.com',
                              facebook: 'facebook.com',
                              line: '@lineid',
                              othercontact: 'dsfasfd',
                              address: {
                                address: '88/82',
                                addressdetail: 'ตรงข้าม big c2',
                                subdistinct: 'ลำลูกกา2',
                                distinct: 'ลำลูกกา2',
                                province: 'ปทุมธานี2',
                                postcode: '121502',
                                lat: '13.93389491',
                                lng: '100.68277732'
                              },
                              items: [],
                              times: [{
                                description: 'ทุกวัน',
                                timestart: '07.00',
                                timeend: '20.00',
                                days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                              }, {
                                description: 'ทุกวัน',
                                timestart: '07.00',
                                timeend: '20.00',
                                days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                              }],
                              coverimage: 'http://www.hardrock.com/cafes/amsterdam/files/2308/LegendsRo22om.jpg',
                            };
                            agent.put('/api/manageshop/' + shops._id)
                              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                              .send(editdatashop)
                              .expect(200)
                              .end(function (manageshopErr, manageshopRes) {
                                // Handle signin error
                                if (manageshopErr) {
                                  return done(manageshopErr);
                                }
                                var manageshopres = manageshopRes.body;

                                (manageshopres.categories[0].name).should.match(categoryshop2.name);
                                (manageshopres.coverimage).should.match(editdatashop.coverimage);
                                (manageshopres.name).should.match(editdatashop.name);
                                (manageshopres.name_eng).should.match(editdatashop.name_eng);
                                (manageshopres.detail).should.match(editdatashop.detail);
                                (manageshopres.email).should.match(editdatashop.email);
                                (manageshopres.tel).should.match(editdatashop.tel);
                                (manageshopres.othercontact).should.match(editdatashop.othercontact);
                                (manageshopres.times).should.match(editdatashop.times);
                                (manageshopres.address.address).should.match(editdatashop.address.address);
                                (manageshopres.address.addressdetail).should.match(editdatashop.address.addressdetail);
                                (manageshopres.address.subdistinct).should.match(editdatashop.address.subdistinct);
                                (manageshopres.address.distinct).should.match(editdatashop.address.distinct);
                                (manageshopres.address.province).should.match(editdatashop.address.province);
                                (manageshopres.address.postcode).should.match(editdatashop.address.postcode);
                                (manageshopres.address.lat).should.match(editdatashop.address.lat);
                                (manageshopres.address.lng).should.match(editdatashop.address.lng);
                                (manageshopres.items.length).should.match(1);
                                (manageshopres.items[0].cate.name).should.match(cate.name);
                                (manageshopres.items[0].products.length).should.match(30);
                                (manageshopres.items[0].products[0].name).should.match('default');
                                done();
                              });
                          });
                      });
                  });
              });
          });

      });
  });

  it('get shops name', function (done) {
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
        agent.get('/api/getshopsname')
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
            (shops[0].name).should.match(shop.name);

            done();
          });
      });
  });

  it('check shop by name false ', function (done) {
    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';

    shop1.save();
    shop2.save();
    shop3.save();

    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        var shopimport = [{
          id: 'ssss',
          name: 'test'
        }];
        agent.post('/api/checkshopbyname')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .send(shopimport)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            var shops = shopsGetRes.body;

            (shops.shopfind.length).should.match(1);
            (shops.shopfind[0].name).should.match('test');
            (shops.shopfind[0].ishave).should.match(false);

            done();
          });
      });
  });

  it('check shop by name true ', function (done) {
    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';

    shop1.save();
    shop2.save();
    shop3.save();

    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        var shopimport = [{
          id: 'ssss',
          name: 'test'
        }, {
          id: 'xxx',
          name: 'shop01'
        }];
        agent.post('/api/checkshopbyname')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .send(shopimport)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            var shops = shopsGetRes.body;

            (shops.shopfind.length).should.match(2);
            (shops.shopfind[0].name).should.match('test');
            (shops.shopfind[1].name).should.match('shop01');

            (shops.shopfind[0].ishave).should.match(false);
            (shops.shopfind[1].ishave).should.match(true);


            done();
          });
      });
  });

  it('remove promote image shop more 10 pic', function (done) {
    // Save a new Shop
    shop.promoteimage = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
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
                    var datapromote = {
                      data: 'image_url'
                    };
                    agent.put('/api/addpromote/' + shops._id)
                      .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                      .send(datapromote)
                      .expect(400)
                      .end(function (changecoverErr, changecoverRes) {
                        // Handle signin error
                        if (changecoverErr) {
                          return done(changecoverErr);
                        }
                        var shopchange = changecoverRes.body;
                        (shopchange.message).should.match('Promote images is limited.');

                        var datapromote = {
                          index: 0
                        };

                        agent.put('/api/removepromote/' + shops._id)
                          .set('authorization', 'Bearer ' + signinRes.body.loginToken)
                          .send(datapromote)
                          .expect(200)
                          .end(function (changecoverErr, changecoverRes) {
                            // Handle signin error
                            if (changecoverErr) {
                              return done(changecoverErr);
                            }
                            var shopchange = changecoverRes.body;
                            (shopchange.promoteimage.length).should.match(9);
                            (shopchange.promoteimage[0]).should.match('2');


                            // (shopchange.message).should.match('Promote images is limited.');
                            done();
                          });
                      });
                  });
              });
          });

      });
  });

  it('search shop name by keyword', function (done) {
    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);

    shop1.name = 'xxxx1';
    shop2.name = 'xxxx2';
    shop3.name = 'cccc3';

    shop1.save();
    shop2.save();
    shop3.save();

    var data = {
      keywordname: 'ccc'
    };

    agent.post('/api/searchkeyword')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        (shops.shops.length).should.match(1);

        done();
      });
  });

  it('search product name by keyword', function (done) {
    var prod1 = new Product({
      name: 'xxxx1',
      price: 50,
      priorityofcate: 1,
      images: ['https://simg.kapook.com/o/photo/410/kapook_world-408206.jpg', 'https://f.ptcdn.info/408/051/000/oqi6tdf9uS1811y1XHx-o.png'],
      user: user,
      categories: categoryproduct
    });
    var prod2 = new Product({
      name: 'xxx2',
      price: 50,
      priorityofcate: 1,
      images: ['https://simg.kapook.com/o/photo/410/kapook_world-408206.jpg', 'https://f.ptcdn.info/408/051/000/oqi6tdf9uS1811y1XHx-o.png'],
      user: user,
      categories: categoryproduct
    });
    var prod3 = new Product({
      name: 'cccccc2',
      price: 50,
      priorityofcate: 1,
      images: ['https://simg.kapook.com/o/photo/410/kapook_world-408206.jpg', 'https://f.ptcdn.info/408/051/000/oqi6tdf9uS1811y1XHx-o.png'],
      user: user,
      categories: categoryproduct
    });

    // prod1.name = 'xxxx1';
    // prod2.name = 'xxxx2';
    // prod3.name = 'cccc3';

    prod1.save();
    prod2.save();
    prod3.save();

    var data = {
      keywordname: 'xx'
    };

    agent.post('/api/searchkeyword')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (productGetErr, productGetRes) {
        // Handle shop save error
        if (productGetErr) {
          return done(productGetErr);
        }
        // Get shop list
        var products = productGetRes.body;

        // Set assertions
        (products.products.length).should.match(2);

        done();
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
