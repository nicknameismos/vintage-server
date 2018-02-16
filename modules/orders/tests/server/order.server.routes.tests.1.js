'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Order = mongoose.model('Order'),
  Shop = mongoose.model('Shop'),
  Product = mongoose.model('Product'),
  Categoryshop = mongoose.model('Categoryshop'),
  Coupon = mongoose.model('Coupon'),
  pushNotification = mongoose.model('Notification'),
  Categoryproduct = mongoose.model('Categoryproduct'),
  omise = require('omise')({
    'publicKey': 'pkey_test_5asc1ucstk1imcxnhy7',
    'secretKey': 'skey_test_5asc1uct2yat7bftf3j'
  }),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  credentials2,
  credentials3,
  user,
  admin,
  shopowner,
  shop,
  product,
  categoryshop,
  categoryproduct,
  token,
  coupon,
  order;

/**
 * Order routes tests
 */
describe('Order omise create tests', function () {

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

    credentials2 = {
      username: 'shop',
      password: '1234'
    };

    credentials3 = {
      username: 'admin',
      password: '1234'
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

    shopowner = new User({
      firstName: 'Shop',
      lastName: 'Name',
      displayName: 'Shop Name',
      email: 'shop@test.com',
      username: credentials2.username,
      password: credentials2.password,
      provider: 'local',
      roles: ['shop']
    });

    admin = new User({
      firstName: 'admin',
      lastName: 'admin',
      displayName: 'admin admin',
      email: 'admin@test.com',
      username: credentials3.username,
      password: credentials3.password,
      provider: 'local',
      roles: ['admin']
    });

    token = '';

    categoryshop = new Categoryshop({
      name: 'อาหารและเครื่องดื่ม'
    });

    categoryproduct = new Categoryproduct({
      name: 'อาหาร',
      priority: 1,
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8NDw8NDw0NDQ8NDQ8PEBAQDg8PDxANFREWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lHx8tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAMQBAgMBEQACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAAAQUCAwQGBwj/xABEEAACAQICBAoGBwcDBQAAAAAAAQIDBAUREiExUQYTMkFhcYGRobEHIlKSwdFCQ1NicoLhFBYjM0RUorLC8BVjg5PS/8QAGwEBAAMBAQEBAAAAAAAAAAAAAAIDBAEFBgf/xAAtEQEAAgECBQQCAgICAwAAAAAAAQIDBBESITFBUQUTFDJCYSJSFXEG8CORof/aAAwDAQACEQMRAD8A+4gAAAAAAAAAAAAAAAAACAOad7CLyk8teWzVmQ4432WRitMbukmrAJAgAAAkABAACQAAAAAAAAAAAAAAAAAAAAAAADGpLJN7kcmdodiN5UijxlanHc9J9mvzKKc5brTw45XhoYEgQAAAAAEgAIAkAAAAAAAAAAAAAAAAAAAAACAJA5r6WUct78NpXknksxRvZw4RHSnUqbsorzfwI4oX6mdqxVbFzIAAAAAAAkCAAAAAAAAJAAAAAAAAAAAAAAAAAAFZilTLsXiyjJPNq09W3CaejSi+eecn27PDItpHJXntvef07iSkAAAAAAAAAAAEAAAEgAAAAAAAAAAAAAAAAACGBRYhLTlorbOeXjkZp52b8X8a7ryEUkktiWRoYJ5zuyOgAAAAAAAAAAAIAAAAEgAAAAAAAAAAAAAAAAGq4noxb6PEjadoSrG8qmzjp3C3U05duxeZVjjed2vLPDj28rsvYgAAAAAAAAAAAQwAAAAAkAAAAAAAAAAAAAAAAA48Qnkkut9xVlldhjeXPgkNU6ntSyXUv1O445J6mecVWhYzAAAAAAAAAAAAMCAAAABIAAAAAAAAAAAAAAAABT4tV5XRqM953ls09VhYUtCnCPOo6+t62X1jaGbJbitMug6gAAAAAAAAAAACAAAAAAkAAAAAAAABjpLegI4xbwHGLp7mA4xbpdwEcat0u4Bxq3PuAiVZdPczk9CFLW9epCL2Snm+rayisb2b4/jjmV7GS5mu80MDIAAAAAAAAAAAQAAAAAACQAAAAAAYTlkgNb6dYHFXxFU/qaz6VTbXeBw1OEsI7ac4/iWQGl8K4dHvICP3qj933gI/emP3e8B+9Ufu+8B0WuOq4fFxy1xbeTT1Eb9FmOObX+2KlW0nCc/VaSjHPdrK8cNGe21Nllb3aqfVTjn7UHEuY3Xk4603q5nsA6IvNZ70BIAAAAAAAACAAAAAAASAAAAAADFoD5VV9J1a1ubi3r2sKsaNxVpqUJOEtGM2lmnmm8stxn96Yno+kx+h1zYq3pbrC4sfSfZVdUqNzSfTCEl3qXwJe/XuozegamkbxMSuaHDCwqfWtfipzXwEZ6eWK3pmpr+LZLhBhr5Vah+ZZeaJe7XyqnQ54/GWEsawnnr2fa6Z33K+Ufh5/wCstbxzBltuLFfmpDjr5d+Fn/rLF8JsFj/V2PZOn8Bx18u/A1H9Za5cNsHhsu6H5VJ+SOe5XylHp2on8Zclf0mYTDZWnP8ADRqPzRz3ara+lam3ZUXnpgs4Z8Va3NR8zkqdOL/yb8Dk5YXR6PljnaYTwF9IFxjGI/szt6VG3hb1arSlKc3JOKjnLUkte4lS8zLLqdJGCvV9PLGFIAAAAAAAAABAAAAAASAAAAAACGB+duHtHi8VvY5ZZ19L3oqXxMeT7S++9ItxaWivw/lPqKbvSy/V6K0IVebkYXR1XCquAlCvrk4WQrpFixiccQHGuqdhRkfRvQFQzvbyplyLWEe2dTP/AGl+Lq+b9Uno+5FzyAAAAAAAAAAAgAAAAAJAAAAAABDA+EelajoYrVft0qM/8cv9pky/Z9v6DbfTR+pl53D+V2FFns5fq9FaEIebdhdnVcKu4CUK6uThZDkoWtStLRpU6lV57IQlLy2HbXrWOcu2vWvWVxbcDL+pr4mNNb6lSEfBZsz21mKO7LbXYo7u+l6Prp8qtQj78vgVT6hTwpn1GnaG5ejapLU7yn+WjKT/ANSOR6hHaqi+viez2HAHAZYE7iUpOu7pUlm6bo6KhpdLz5RP/JTT8HlamffmNuz2Cx9vUqOb3KT+Qj1aenCzTpf22TxyUeVQlHPfLL4E59UtHWiMabfpKI8IY89KXZJM7Hq1e9T4tvLdDHqL2qcezPyLK+qYp67ozpruuhf0qnJqRb3N5PuZrx6rFk6SqtjtXrDpzNCCQAAABAAAAAASAAAAIAkCAPi/pnoaN/RqfaWkV2xqS/8AozZvs+w/47bfDaPEvHYfyuwzWfQ5fq9FacxCHm3Y3Z1VCsnTlOSjGLlKTySSzbZyZiI3l2bREby9DhXA6OSq3Wcs9lOOajnulLn6kYsurtt/F5+bX8+Gj1uG2tGDjTioUIbPViooxb8dv5S87Je0xvKwxC1p04qUambb5LabfSW5cNKxvWVGO8zO0q7SM2y7ZvtLripaWSlqy1k6Wmlt0bV4o2Z3mISrZJpRS2Jb+knlzTk5I0xRVpo13CSktqK6zwzusmu8Om6xOVWOg4xis9eW0uyZ5vGyuuLhndz0qU58mMpZbckU1xzbpCczEMJpxeTTTXM9TOTWYnYiYmHfZ2CrQ0lUyluy1J9JoxYeON4nmqvkms80W+J1reTg5aSi8nGTzXY+YsxavLhnbq5bDW8bw9Dh2J0661PRktsXt7N57en1dM0curFkxWp1dxrVJAAQAAAAAACQIAkAAAAfJvTfR/iWVTfCtDxgzPn7S+p/45b71/0+fYfyuwy26Pp8v1eitCEPOuxuYtvJLNt5Jb2JnbnKreI5y9Dg+Gxt46TSdWS9aW5eyjy8+ab227PK1GabztHR6nErunxNOnBp8l6uZJc/SdyZKzSKw87HjtxTMqjTM2zTsaY27ObOvDbmnTk5VIuWrVqTy7C3FNazzhXlpM9E4nfRrSThDRUVt1Zs7mvFp5QYsc16uPTKdlvCsIYVVlBTjovNZ5Z68i6uCbV3hROWsTtKvcinbntK/bu7bPFJ0Y6KUWs89e8tx5bY+iq+GLTvLnuLqVWTnJ633ZEL2m87ynWkVjZhCtKOuMnF9DaORM16OzWJ6sXU52c7u8LKnWcWpRbi0801tTJUtas71ctSJjaXscExRXEcnqqQS0lvW9H0Wj1UZa7T1h5WfDOOf0szaoAJAAAAACAJAgCQAAAB839NlHO2tamXIuXHslTfyRRm6Pof+O22z2j9PluH8rsMln2GXo9FacxCHm3WeF0E5uo/o6o/i3/83mXVZNo4Y7vP1V9o4Y7rbTPP2YNjS6xtsdXTh90qVSM5LSinr6mSpynmhkrM15OrHKlGThOjKLck9NR7Mm1zPaW5orymqrBF45WVmmUNDvwrD3cNvS0IxyTeWbz3Itx4+LqpzZeBqxKjGjUdOM9NJLN6tT3HMlIrO0SljtNq7yihiNWmtGFSSW7U/M5W9q9C2Ktp5w0wbnJJP1pyy1vnbIdU+UQ6r3DatBaUknHZnF5pPpLLYrRG6qmWtp2cWkVrtlzYV7OFNOotKeXrJxbefRzGjHbHEfyZclcs25KmrUTlJxWjFt5LPPJZ6kU25zyaa1nbmua1GlOzVWKipU4xza26Wxpl/BWce8dWWLWrl2lV2F7KhUjUX0XrW+POiGDJOO8WhflxxesxL6HRqKcYyi81JJrqZ9PS0WiJh4kxtOzMk4kABAEgAIAkAAAAAAHh/TBR0sNcvs69KXe9H4lOb6vZ9Cttq4jzEvjuH8p9Rjt0fb5uj0VpzEIebdd2ktGCXb3nm553v/p4+a29/wDS0wWpS45Os0oxi2tLY5c2fiRx7RPNlzcU1/iyxvEY16ulDkxiop5ZZ63r8SWW0Wnk5hpNK81dxpVsu3b7Km61SNKLycnt3LnZ2teKdkb34azLrxu0jbTjCM3LOGk88s08+gnlxxWeSvDknJG8uCndyjmozlHPbk2syvnC2YiU0HpyjDNJyklm9mt8423km3DCxxLCKtvHjM1OGrNrNOOe9biy2Gaxupx6iLTsquN6SvZe7qmNVp03RlJOLWTbS0suss9ydtpU+zSJ3ccJOTyinJ7ks2VxEytm0R1JycXlJSi9zTT8RwzBFonox40bO7p47pDhxo22d3e84I3PGW0U3m6cpQ7Nq8Ge/oL8WKN+zx9XXbJ/tdG1mAJAgCQIAkAAAAAAADy/pMo6eE3a9mNOfuVYy+BXljesvS9Ivw6yk/8Aej4bh/K7DFZ9/l+r0VoVw8zItab1LqPNyRtbm8TLExad2WshyVms6GsDba3M6M1Ug8pR2as0InZy1YtG0ouLidWTnNuUpbWN5nnJWIrG0NebOOmbA6qmJ3EqfEyqycNWp5PUunaT47bbIe3Xfdy5sgsM2BYYNirtZSlxanppJ68mupkqW4Z3VZMXHCMYxWd3KMnBQUE1FLW9e9ksl+IxYuBwZsgtZ26TnBTejFzipPdHPWxCNt9uS9x++t+Kjb0IweUk3KK1JLp52y296zXaGfFS3FxWXPAKElRqNr1ZVfV6co5M9P06P4TLLrJib8npz0WNIAAAAAQBIEASAAAAKfhfR4zD72G+1q+EW/gRv0lq0VuHUUn9w/PmH7ew8+z9Gy/V6Oz5iEPNut8MrU4qUZrlSzTyzyPI9Rx5LXi2Ps8H1GtpvHD2d2hSlyZQfbkeZ7menV5nHnq6bOyozejNuLexqSafgPl5Y7f/ABbTUXnrDtlwdjzVZdsUxHqFu9Vvvtb4Ovmqr3P1Jf5D9Je/HhrlwfkvrYdqaJ/Pr4d96PDTPCGvraXe/kd+dTwe/Vh/0x/aU+9/I786h8iiVhTf1lL3n8h86h79GyOBzeydN/mfyHzqeHfehmuD9T24ePyOfPp4c96rJcHZ/aQ7mR/yFfDnvwzXBx89VdkP1Iz6h4hz34a7nCaVJetVlKXNFKKY+beelXLZ5iOiudKK/WQ+Tlnoyzqss9GLq04ez5j/AM90eLPd7HgLecbSqxyy4urq6pR/Q+n9IpNMU1nyqzUmsxu9MespSAAAAAEASBAEgAAADmxCnp0asPapTj3xaOT0WYp2yVn9w/N2HrKTT2rV3HnWfpV53pEvRWZCHn3bHcxg8pc/aUZse87ww5tNbJPFVsVaEtkovtRm4JjsxXwZK9YYSY4Y8K+H9PQ4Lwo4qLp3GlNRj6klrl1P5nn59DFp3opvi36OXEuGNaeaoxjSjvfrTy8l4k8Xp1K/Z2uGO6usOEM4ylx8qlVTy16WuLWexbMtZPU6GLxHt8kc2Hij+KzhjFtLZcKPRNOL8TzbaHNX8WG2myNqvqT2XNB/+SHzK/j5P6z/AOlc4bx2RK/prbXof+2HzHxsn9Zc9q/hqljVCP8AUU/yz0n4FldHln8ZTjFm8NNThg4fypSqP7yyj462a8fptp+7VjwZJ+yywzhvCWUa9JwftQelHu2rxOZfTJj6Sutg8OzF+FNOEdG3cas5LPS2xin5voKsOgmZ3vy2Rphnu8nKvOpJznJylJ622epGOsRtENHDHhtzyWvV1neHxDsUmekOWvf0YcqpHPcnpPuRZXFaekNGPR5r9Ky+j+jZ052jrU56fG1HpLRcXCUdWi/PtPY0mPgrz7vH9Rx3xZuC8dHrDWwAEgAIAkCAAACQAAABElmmt4I5S/N9SnoXVxD2K9WPdUa+B5136TjnfBSf1C5tOYrhkuxu8Kr3GdW3cZTp6pU28nKL2Nc2eZC+WtJ2shXU1xzw3UtxWq0XlXoVKb6YuPmTjgt0lrrfHf6zDCOJw3zj/wA6Gd9snHSesMnia+0famc9r9ITp8M9Ya54l/3P8f0EYoR+Jp/DRLFPvJ/lJe1WUZ0ml/bTPFujPsHtVU3waaOm7vw7DMQvGlRtHGLf8yonCmutv4ZlV74qdZeflnDXo9ff8AmreLo1FO5ik5qT0aU3l6yjqzXRmY66uOLnHJlw5sfH/OOTyN1aV7V5V7arDL6WT0e/Z4m2tqW6S9imn02TnWzXC/p/eXYmS9tb8HE2LEYc0svynPZTjRYI7Ilie6p4fod9qPCcaXTx2c1TE5fbT7G0TjFXwtimmr+LmqYgueU5dbb82S4Ijs7Oow16Q3Wdnd3LyoW1SWf0nFqC6XJ6iNslK9ZZsvqW31fdfRjhNSysI0qsoyqTq1KktHkrNpZJ8+w06W8XpvHR8d6hmnLmm0vWmlhAAAABIEAAJAAAAACGB+feEFHi8TvYL+6qS96Wl8Tz8vWX6Fob8Wjxz+nXZ8xVCu7ptb529TT2xeqS3x+ZXnxRkrsy5sUZK7PTUrmFWKlFqcX2955M1mk7PKmtqTtLnrYdbVOXb0JddOJKMt47pVzZI6S5ZcHrF/0lLszXkyXyMvlP5OX+zFcG7D+1p98/md+Tl8nycvlshgFjHZaUO2Gl5nJz5J7ozmyT3dtC3o0/5dKlD8MIx8iE3vPWVczM9Zb+N6SG0o8O5xo2OGDjRtJETHRzV7KhU5dCjPrpxZOMl46StjLkjpLklgFi9tpR7E15E4z5I7pxqcv9mv8Aduw/taffP5nfk5fLvycvlnHg/YrZaUO2Ol5nPkZZ7oznyeXZQsqFLkUKMPw04r4EJyXnrKubWnrKzw+2ncTUILV9KXNFFmDT3zW2hny5IpG8vbW1FU4RhHZFZI+mxY4x1isdnk2ned2wscAAAAAAASAAAAAACGB5/FeD1tcycq1vCcm3/ESynl1rWQtjrbq1YdbmwxtS07KafAm2z/h1qlPok1JeKzKZ09ezdX1nN+Ubq684BVnrhXpy64tEZ08tFfWa/lVXR4FYlRlpUqlFb1pvJ9aaKr6SbdU59U09/tCztcIxDZVo0fxQqv8A0tfEyX9Nt+Ms19Xg/GZbK2HXENtKTW+OUvIy20eWvYrnx27uOU2tTzT6VkUTS0dV0TWeiON6SOzuxxvSNjY43pGxscb0jY2ON6RsbHG9I2Njjek7wmzKDctUU5PoTZKMdrdIRm1Y6u+2wi5qbKTit82orx1l9NFlt2U31GOvddWPBdanWqaX3Yal3s3YvTI63lkvrJnlWHoba3hSioQioxXMj0qY60jasMdrzad5bSxEAkCAAACQIQEgAAAABGQEOCAxdFAYu3iwMHZQAj9ijvku1gQ7Fe1PvYGLw6PtS72Bpq4NSnys5desjNKz1hKLzHdzy4M2z+rXiVTp8U9k4z5I7sHwUtX9B9kpfMhOjwz2S+TkjuxfBK19mfvyI/Bw+HflZfIuCVrun78h8HD4d+Xk8so8FLRfQb/PP5nfhYfDnysnltjwatF9TF9ek/Nko0mGOznyMnl0U8Ft47KNNfkiTjBjjpCE5bz1l0xtYrUtXVkiyK1jshNplnxC6STiVSQGSigJQACQIAkABAAAAAkAAAAAAAAAAAAAAABAEgAGQAAAAAAAACAAAAAA/9k=',
      shop: shop,
      user: user
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
      islaunch: true,
      categories: categoryshop,
      user: user
    });



    product = new Product({
      name: 'Product name',
      price: 200,
      priorityofcate: 1,
      images: ['https://simg.kapook.com/o/photo/410/kapook_world-408206.jpg', 'https://f.ptcdn.info/408/051/000/oqi6tdf9uS1811y1XHx-o.png'],
      categories: categoryproduct,
      shop: shop,
      user: user
    });
    var today = new Date();
    var startdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    var enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    coupon = new Coupon({
      code: 'AC-100',
      price: 100,
      type: 'multi',
      owner: [],
      startdate: startdate,
      enddate: enddate,
      useruse: [],
      user: user
    });

    // Save a user to the test db and create new Order
    user.save(function () {
      shopowner.save(function () {
        admin.save(function () {
          shop.save(function () {
            product.save(function () {
              coupon.save(function () {
                order = {
                  items: [{
                    product: {
                      _id: product.id,
                      name: 'แก้วน้ำมหัศจรรย์ขันทอง',
                      price: 200,
                      images: ['img1', 'img2'],
                      shopid: shop.id
                    },
                    shipping: {
                      ref: {
                        name: 'EMS'
                      },
                      price: 100
                    },
                    log: [],
                    remark: '',
                    qty: 1,
                    amount: 300
                  }],
                  shippingAddress: {
                    name: 'Ass',
                    tel: '0999999999',
                    address: {
                      address: 'address',
                      district: 'districe',
                      subdistrict: 'subdistrict',
                      province: 'province',
                      postcode: '12150'
                    },
                    location: {
                      lat: 19999,
                      lng: 20000
                    }
                  },
                  coupon: {
                    code: 'AC-100',
                    discount: 100
                  },
                  payment: {
                    paymenttype: 'Internal Banking',
                    creditno: '',
                    creditname: '',
                    expdate: '',
                    creditcvc: ''
                  },
                  omiseToken: '',
                  qty: 1,
                  amount: 200,
                  shippingamount: 100,
                  discountamount: 100,
                  totalamount: 200,
                  omiseresponse: {},
                  user: user
                };
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
      });
    });
  });

  it('should be have Token logged in with token', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('create order update coupon', function (done) {
    // Update Order name
    var cardDetails = {
      card: {
        'name': 'JOHN DOE',
        'city': 'Bangkok',
        'postal_code': 10320,
        'number': '4242424242424242',
        'expiration_month': 2,
        'expiration_year': 2018
      }
    };
    omise.tokens.create(cardDetails).then(function (token1) {
      order.omiseToken = token1.id;
      order.payment.paymenttype = 'Credit Card';
      // Save a new Order
      agent.post('/api/orders')
        .set('authorization', 'Bearer ' + token)
        .send(order)
        .expect(200)
        .end(function (orderSaveErr, orderSaveRes) {
          // Handle Order save error
          if (orderSaveErr) {
            return done(orderSaveErr);
          }
          // Set assertions
          agent.get('/api/orders')
            // .set('authorization', 'Bearer ' + token)
            .end(function (order2Err, order2Res) {
              // Handle signin error
              if (order2Err) {
                return done(order2Err);
              }
              var ord2 = order2Res.body;
              (ord2.length).should.match(1);
              (ord2[0].omiseresponse.capture).should.match(true);
              (ord2[0].omiseToken).should.match(token1.id);
              agent.get('/api/coupons')
                .end(function (couponsErr, couponsRes) {
                  // Handle signin error
                  if (couponsErr) {
                    return done(couponsErr);
                  }
                  var coupons = couponsRes.body;
                  (coupons.length).should.match(1);
                  (coupons[0].useruse.length).should.match(1);
                  (coupons[0].useruse[0]).should.match(user.id);
                  done();

                });
            });
        });
    });
  });

  it('payment order', function (done) {
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



        // Update Order name
        var cardDetails = {
          card: {
            'name': 'JOHN DOE',
            'city': 'Bangkok',
            'postal_code': 10320,
            'number': '4242424242424242',
            'expiration_month': 2,
            'expiration_year': 2018
          }
        };
        omise.tokens.create(cardDetails).then(function (token1) {
          order.omiseToken = token1.id;
          order.payment.paymenttype = 'Credit Card';
          // Save a new Order
          agent.post('/api/orders')
            .send(order)
            .expect(200)
            .end(function (orderSaveErr, orderSaveRes) {
              // Handle Order save error
              if (orderSaveErr) {
                return done(orderSaveErr);
              }
              // Set assertions
              agent.get('/api/orders')
                // .set('authorization', 'Bearer ' + token)
                .end(function (order2Err, order2Res) {
                  // Handle signin error
                  if (order2Err) {
                    return done(order2Err);
                  }
                  var ord2 = order2Res.body;
                  (ord2.length).should.match(1);
                  (ord2[0].omiseresponse.capture).should.match(true);
                  (ord2[0].omiseToken).should.match(token1.id);
                  (ord2[0].items[0].status).should.match('confirm');
                  (ord2[0].items[0].log.length).should.match(1);
                  (ord2[0].items[0].log[0].status).should.match('confirm');
                  (ord2[0].items[0].product).should.match(product.id);

                  // Set assertions
                  agent.get('/api/notifications')
                    // .set('authorization', 'Bearer ' + token)
                    .end(function (notiErr, notiRes) {
                      // Handle signin error
                      if (notiErr) {
                        return done(notiErr);
                      }
                      var noti = notiRes.body;
                      (noti.length).should.match(2);

                      done();

                    });

                });
            });
        });
      });
  });

  it('get list order by user', function (done) {

    // Update Order name
    var cardDetails = {
      card: {
        'name': 'JOHN DOE',
        'city': 'Bangkok',
        'postal_code': 10320,
        'number': '4242424242424242',
        'expiration_month': 2,
        'expiration_year': 2018
      }
    };
    omise.tokens.create(cardDetails).then(function (token1) {
      order.omiseToken = token1.id;
      order.payment.paymenttype = 'Credit Card';
      // Save a new Order
      order.items.push({
        product: {
          _id: product.id,
          name: 'sent',
          price: 200,
          images: ['img1', 'img2'],
          shopid: shop.id
        },
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
          product: {
            _id: product.id,
            name: 'completed',
            price: 200,
            images: ['img1', 'img2'],
            shopid: shop.id
          },
          shipping: {
            ref: {
              name: 'EMS'
            },
            price: 100
          },
          status: 'completed',
          log: [
            { status: 'sent', created: new Date() },
            { status: 'completed', created: new Date() }
          ],
          remark: '',
          qty: 1,
          amount: 300,
          refid: '1234'
        }, {
          product: {
            _id: product.id,
            name: 'cancel',
            price: 200,
            images: ['img1', 'img2'],
            shopid: shop.id
          },
          shipping: {
            ref: {
              name: 'EMS'
            },
            price: 100
          },
          log: [
            { status: 'cancel', created: new Date() }
          ],
          status: 'cancel',
          remark: '',
          qty: 1,
          amount: 300
        }, {
          product: {
            _id: product.id,
            name: 'reject',
            price: 200,
            images: ['img1', 'img2'],
            shopid: shop.id
          },
          shipping: {
            ref: {
              name: 'EMS'
            },
            price: 100
          },
          log: [
            { status: 'reject', created: new Date() }
          ],
          status: 'reject',
          remark: 'out of stock',
          qty: 1,
          amount: 300
        });
      agent.post('/api/orders')
        .set('authorization', 'Bearer ' + token)
        .send(order)
        .expect(200)
        .end(function (orderSaveErr, orderSaveRes) {
          // Handle Order save error
          if (orderSaveErr) {
            return done(orderSaveErr);
          }
          // Set assertions
          agent.get('/api/orders')
            // .set('authorization', 'Bearer ' + token)
            .end(function (order2Err, order2Res) {
              // Handle signin error
              if (order2Err) {
                return done(order2Err);
              }
              var ord2 = order2Res.body;
              (ord2.length).should.match(1);
              (ord2[0].omiseresponse.capture).should.match(true);
              (ord2[0].omiseToken).should.match(token1.id);
              (ord2[0].items.length).should.match(5);
              (ord2[0].items[0].status).should.match('confirm');
              (ord2[0].items[0].log.length).should.match(1);
              (ord2[0].items[0].log[0].status).should.match('confirm');

              agent.get('/api/customergetorders')
                .set('authorization', 'Bearer ' + token)
                .end(function (customergetordersErr, customergetordersRes) {
                  // Handle signin error
                  if (customergetordersErr) {
                    return done(customergetordersErr);
                  }
                  var cord = customergetordersRes.body;
                  (cord.length).should.match(4);
                  (cord[0].status).should.match('confirm');
                  (cord[0].items.length).should.match(1);
                  // (cord[0].items[0].itemid).should.match(ord2.items[0]);
                  // (cord[0].items[0].orderid).should.match(1234);
                  (cord[0].items[0].name).should.match(product.name);
                  (cord[0].items[0].image).should.match(product.images[0]);
                  (cord[0].items[0].price).should.match(order.items[0].product.price);
                  (cord[0].items[0].qty).should.match(order.items[0].qty);
                  (cord[0].items[0].shippingtype).should.match(order.items[0].shipping.ref.name);
                  (cord[0].items[0].shippingprice).should.match(order.items[0].shipping.price);
                  (cord[0].items[0].amount).should.match(order.items[0].amount);
                  (cord[0].items[0].sentdate).should.match('');
                  (cord[0].items[0].receivedate).should.match('');
                  (cord[0].items[0].canceldate).should.match('');
                  (cord[0].items[0].isrefund).should.match(false);
                  (cord[0].items[0].status).should.match('confirm');
                  (cord[0].items[0].rejectreason).should.match('');
                  (cord[0].items[0].refid).should.match('');

                  (cord[1].status).should.match('sent');
                  (cord[1].items.length).should.match(1);
                  (cord[1].items[0].name).should.match(product.name);
                  (cord[1].items[0].image).should.match(product.images[0]);
                  (cord[1].items[0].price).should.match(order.items[1].product.price);
                  (cord[1].items[0].qty).should.match(order.items[1].qty);
                  (cord[1].items[0].shippingtype).should.match(order.items[1].shipping.ref.name);
                  (cord[1].items[0].shippingprice).should.match(order.items[1].shipping.price);
                  (cord[1].items[0].amount).should.match(order.items[1].amount);
                  (cord[1].items[0].sentdate).should.match(order.items[1].log[0].created);
                  (cord[1].items[0].receivedate).should.match('');
                  (cord[1].items[0].canceldate).should.match('');
                  (cord[1].items[0].isrefund).should.match(false);
                  (cord[1].items[0].status).should.match('sent');
                  (cord[1].items[0].rejectreason).should.match('');
                  (cord[1].items[0].refid).should.match('');

                  (cord[2].status).should.match('completed');
                  (cord[2].items.length).should.match(1);
                  (cord[2].items[0].name).should.match(product.name);
                  (cord[2].items[0].image).should.match(product.images[0]);
                  (cord[2].items[0].price).should.match(order.items[2].product.price);
                  (cord[2].items[0].qty).should.match(order.items[2].qty);
                  (cord[2].items[0].shippingtype).should.match(order.items[2].shipping.ref.name);
                  (cord[2].items[0].shippingprice).should.match(order.items[2].shipping.price);
                  (cord[2].items[0].amount).should.match(order.items[2].amount);
                  (cord[2].items[0].sentdate).should.match(order.items[2].log[0].created);
                  (cord[2].items[0].receivedate).should.match(order.items[2].log[1].created);
                  (cord[2].items[0].canceldate).should.match('');
                  (cord[2].items[0].isrefund).should.match(false);
                  (cord[2].items[0].status).should.match('completed');
                  (cord[2].items[0].rejectreason).should.match('');
                  (cord[2].items[0].refid).should.match('1234');

                  (cord[3].status).should.match('cancel');
                  (cord[3].items.length).should.match(2);
                  (cord[3].items[0].name).should.match(product.name);
                  (cord[3].items[0].image).should.match(product.images[0]);
                  (cord[3].items[0].price).should.match(order.items[3].product.price);
                  (cord[3].items[0].qty).should.match(order.items[3].qty);
                  (cord[3].items[0].shippingtype).should.match(order.items[3].shipping.ref.name);
                  (cord[3].items[0].shippingprice).should.match(order.items[3].shipping.price);
                  (cord[3].items[0].amount).should.match(order.items[3].amount);
                  (cord[3].items[0].sentdate).should.match('');
                  (cord[3].items[0].receivedate).should.match('');
                  (cord[3].items[0].canceldate).should.match(order.items[3].log[0].created);
                  (cord[3].items[0].isrefund).should.match(false);
                  (cord[3].items[0].status).should.match('cancel');
                  (cord[3].items[0].rejectreason).should.match('');
                  (cord[3].items[0].refid).should.match('');

                  (cord[3].items[1].name).should.match(product.name);
                  (cord[3].items[1].image).should.match(product.images[0]);
                  (cord[3].items[1].price).should.match(order.items[4].product.price);
                  (cord[3].items[1].qty).should.match(order.items[4].qty);
                  (cord[3].items[1].shippingtype).should.match(order.items[4].shipping.ref.name);
                  (cord[3].items[1].shippingprice).should.match(order.items[4].shipping.price);
                  (cord[3].items[1].amount).should.match(order.items[4].amount);
                  (cord[3].items[1].sentdate).should.match('');
                  (cord[3].items[1].receivedate).should.match('');
                  (cord[3].items[1].canceldate).should.match(order.items[4].log[0].created);
                  (cord[3].items[1].isrefund).should.match(false);
                  (cord[3].items[1].status).should.match('reject');
                  (cord[3].items[1].rejectreason).should.match(order.items[4].remark);
                  (cord[3].items[1].refid).should.match('');

                  done();

                });

            });
        });
    });
  });

  it('get list order by shop', function (done) {

    // Save a new Order

    var orderObj = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    var orderObj2 = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials2)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            agent.get('/api/shopgetorders/' + shop.id)
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match('');
                (cord.length).should.match(4);
                (cord[0].status).should.match('confirm');
                (cord[0].items.length).should.match(1);
                // (cord[0].items[0].itemid).should.match(ord2.items[0]);
                // (cord[0].items[0].orderid).should.match(1234);
                (cord[0].items[0].name).should.match(product.name);
                (cord[0].items[0].image).should.match(product.images[0]);
                (cord[0].items[0].price).should.match(product.price);
                (cord[0].items[0].qty).should.match(orderObj.items[0].qty);
                (cord[0].items[0].shippingtype).should.match(orderObj.items[0].shipping.ref.name);
                (cord[0].items[0].shippingprice).should.match(orderObj.items[0].shipping.price);
                (cord[0].items[0].amount).should.match(orderObj.items[0].amount);
                (cord[0].items[0].sentdate).should.match('');
                (cord[0].items[0].receivedate).should.match('');
                (cord[0].items[0].canceldate).should.match('');
                (cord[0].items[0].isrefund).should.match(false);
                (cord[0].items[0].status).should.match('confirm');
                (cord[0].items[0].rejectreason).should.match('');

                (cord[1].status).should.match('sent');
                (cord[1].items.length).should.match(1);
                (cord[1].items[0].name).should.match(product.name);
                (cord[1].items[0].image).should.match(product.images[0]);
                (cord[1].items[0].price).should.match(product.price);
                (cord[1].items[0].qty).should.match(orderObj.items[1].qty);
                (cord[1].items[0].shippingtype).should.match(orderObj.items[1].shipping.ref.name);
                (cord[1].items[0].shippingprice).should.match(orderObj.items[1].shipping.price);
                (cord[1].items[0].amount).should.match(orderObj.items[1].amount);
                (cord[1].items[0].sentdate).should.match(orderObj.items[1].log[0].created);
                (cord[1].items[0].receivedate).should.match('');
                (cord[1].items[0].canceldate).should.match('');
                (cord[1].items[0].isrefund).should.match(false);
                (cord[1].items[0].status).should.match('sent');
                (cord[1].items[0].rejectreason).should.match('');

                (cord[2].status).should.match('completed');
                (cord[2].items.length).should.match(2);
                (cord[2].items[0].name).should.match(product.name);
                (cord[2].items[0].image).should.match(product.images[0]);
                (cord[2].items[0].price).should.match(product.price);
                (cord[2].items[0].qty).should.match(orderObj2.items[0].qty);
                (cord[2].items[0].shippingtype).should.match(orderObj2.items[0].shipping.ref.name);
                (cord[2].items[0].shippingprice).should.match(orderObj2.items[0].shipping.price);
                (cord[2].items[0].amount).should.match(orderObj2.items[0].amount);
                (cord[2].items[0].sentdate).should.match(orderObj2.items[0].log[0].created);
                (cord[2].items[0].receivedate).should.match(orderObj2.items[0].log[1].created);
                (cord[2].items[0].canceldate).should.match('');
                (cord[2].items[0].isrefund).should.match(false);
                (cord[2].items[0].status).should.match('transferred');
                (cord[2].items[0].rejectreason).should.match('');

                (cord[2].items[1].name).should.match(product.name);
                (cord[2].items[1].image).should.match(product.images[0]);
                (cord[2].items[1].price).should.match(product.price);
                (cord[2].items[1].qty).should.match(orderObj.items[2].qty);
                (cord[2].items[1].shippingtype).should.match(orderObj.items[2].shipping.ref.name);
                (cord[2].items[1].shippingprice).should.match(orderObj.items[2].shipping.price);
                (cord[2].items[1].amount).should.match(orderObj.items[2].amount);
                (cord[2].items[1].sentdate).should.match(orderObj.items[2].log[0].created);
                (cord[2].items[1].receivedate).should.match(orderObj.items[2].log[1].created);
                (cord[2].items[1].canceldate).should.match('');
                (cord[2].items[1].isrefund).should.match(false);
                (cord[2].items[1].status).should.match('completed');
                (cord[2].items[1].rejectreason).should.match('');

                (cord[3].status).should.match('cancel');
                (cord[3].items.length).should.match(2);
                (cord[3].items[0].name).should.match(product.name);
                (cord[3].items[0].image).should.match(product.images[0]);
                (cord[3].items[0].price).should.match(product.price);
                (cord[3].items[0].qty).should.match(orderObj.items[3].qty);
                (cord[3].items[0].shippingtype).should.match(orderObj.items[3].shipping.ref.name);
                (cord[3].items[0].shippingprice).should.match(orderObj.items[3].shipping.price);
                (cord[3].items[0].amount).should.match(orderObj.items[3].amount);
                (cord[3].items[0].sentdate).should.match('');
                (cord[3].items[0].receivedate).should.match('');
                (cord[3].items[0].canceldate).should.match(orderObj.items[3].log[0].created);
                (cord[3].items[0].isrefund).should.match(false);
                (cord[3].items[0].status).should.match('cancel');
                (cord[3].items[0].rejectreason).should.match('');

                (cord[3].items[1].name).should.match(product.name);
                (cord[3].items[1].image).should.match(product.images[0]);
                (cord[3].items[1].price).should.match(product.price);
                (cord[3].items[1].qty).should.match(orderObj.items[4].qty);
                (cord[3].items[1].shippingtype).should.match(orderObj.items[4].shipping.ref.name);
                (cord[3].items[1].shippingprice).should.match(orderObj.items[4].shipping.price);
                (cord[3].items[1].amount).should.match(orderObj.items[4].amount);
                (cord[3].items[1].sentdate).should.match('');
                (cord[3].items[1].receivedate).should.match('');
                (cord[3].items[1].canceldate).should.match(orderObj.items[4].log[0].created);
                (cord[3].items[1].isrefund).should.match(false);
                (cord[3].items[1].status).should.match('reject');
                (cord[3].items[1].rejectreason).should.match(orderObj.items[4].remark);

                done();

              });
          });
      });
  });

  it('get order detail', function (done) {

    // Save a new Order

    var orderObj = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    var orderObj2 = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials2)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            agent.get('/api/getorderdetail/' + orderObj2.id + '/' + orderObj2.items[0].id)
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match('');
                // (cord._id).should.match(orderObj2.id);
                // (cord.itm_id).should.match(orderObj2.items[0].id);
                (cord.itemid).should.match(orderObj2.items[0].id);
                (cord.orderid).should.match(orderObj2.id);
                (cord.shop._id).should.match(shop.id);
                (cord.shop.name).should.match(shop.name);
                (cord.product._id).should.match(product.id);
                (cord.product.name).should.match(product.name);
                (cord.product.image).should.match(product.images[0]);
                (cord.product.price).should.match(product.price);
                (cord.product.qty).should.match(orderObj2.items[0].qty);
                (cord.product.shippingtype).should.match(orderObj2.items[0].shipping.ref.name);
                (cord.product.shippingtrack).should.match(orderObj2.items[0].refid);
                (cord.product.shippingprice).should.match(orderObj2.items[0].shipping.price);
                (cord.amount).should.match(orderObj2.items[0].amount);
                (cord.paymenttype).should.match(orderObj2.payment.paymenttype);
                (cord.shipping.name).should.match(orderObj2.shippingAddress.name);
                (cord.shipping.tel).should.match(orderObj2.shippingAddress.tel);
                (cord.shipping.address).should.match(orderObj2.shippingAddress.address.address);
                (cord.shipping.subdistrict).should.match(orderObj2.shippingAddress.address.subdistrict);
                (cord.shipping.district).should.match(orderObj2.shippingAddress.address.district);
                (cord.shipping.province).should.match(orderObj2.shippingAddress.address.province);
                (cord.shipping.postcode).should.match(orderObj2.shippingAddress.address.postcode);
                (cord.confirmdate).should.match('');
                (cord.sentdate).should.match(orderObj2.items[0].log[0].created);
                (cord.receiveddate).should.match('');
                (cord.canceldate).should.match('');
                (cord.transferdate).should.match(orderObj2.items[0].log[1].created);
                (cord.isrefund).should.match(false);
                (cord.status).should.match('transferred');
                (cord.rejectreason).should.match('');


                done();

              });
          });
      });
  });

  it('user cancel order item success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 5,
      amount: 1000,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 900,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    var orderObj2 = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[0].id
            };
            agent.post('/api/cancelitem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord._id).should.match(orderObj.id);
                (cord.items[0]._id).should.match(orderObj.items[0].id);
                (cord.items[0].status).should.match('cancel');
                // (cord.qty).should.match(4);
                // (cord.amount).should.match(800);
                // (cord.totalamount).should.match(700);
                agent.get('/api/notifications')
                  // .set('authorization', 'Bearer ' + token)
                  .end(function (notiErr, notiRes) {
                    // Handle signin error
                    if (notiErr) {
                      return done(notiErr);
                    }
                    var noti = notiRes.body;
                    (noti.length).should.match(1);
                    // (noti).should.match(1);

                    done();

                  });

              });
          });
      });
  });

  it('user cancel order item unsuccess', function (done) {
    // Save a new Order
    var orderObj = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    var orderObj2 = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[1].id
            };
            agent.post('/api/cancelitem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .expect(400)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.message).should.match('can not cancel item!');


                done();

              });
          });
      });
  });

  it('user complete order item success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    var orderObj2 = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[0].id
            };
            agent.post('/api/completeitem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord._id).should.match(orderObj.id);
                (cord.items[0]._id).should.match(orderObj.items[0].id);
                (cord.items[0].status).should.match('completed');


                done();

              });
          });
      });
  });

  it('shop sent order item success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    var orderObj2 = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials2)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[0].id,
              refid: 'asdf'
            };
            agent.post('/api/sentitem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord._id).should.match(orderObj.id);
                (cord.items[0]._id).should.match(orderObj.items[0].id);
                (cord.items[0].status).should.match('sent');
                (cord.items[0].refid).should.match('asdf');


                done();

              });
          });
      });
  });

  it('shop sent order item unsuccess', function (done) {
    // Save a new Order
    var orderObj = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    var orderObj2 = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials2)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[3].id
            };
            agent.post('/api/sentitem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .expect(400)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.message).should.match('this item cancel by user!');


                done();

              });
          });
      });
  });

  it('shop reject order item success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    var orderObj2 = new Order({
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user,
      docno: +new Date()
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials2)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[0].id,
              remark: 'aaa'
            };
            agent.post('/api/rejectitem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord._id).should.match(orderObj.id);
                (cord.items[0]._id).should.match(orderObj.items[0].id);
                (cord.items[0].status).should.match('reject');
                (cord.items[0].remark).should.match('aaa');


                done();

              });
          });
      });
  });

  it('shop reject order item unsuccess', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials2)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[3].id
            };
            agent.post('/api/rejectitem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .expect(400)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.message).should.match('this item cancel by user!');


                done();

              });
          });
      });
  });

  it('admin transferred order item success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[2].id
            };
            agent.post('/api/transferitem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord._id).should.match(orderObj.id);
                (cord.items[2]._id).should.match(orderObj.items[2].id);
                (cord.items[2].status).should.match('transferred');


                done();

              });
          });
      });
  });

  it('admin cancelrefund order item success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[3].id
            };
            agent.post('/api/refunditem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord._id).should.match(orderObj.id);
                (cord.items[3]._id).should.match(orderObj.items[3].id);
                (cord.items[3].status).should.match('cancelrefund');


                done();

              });
          });
      });
  });

  it('admin rejectrefund order item success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              orderid: orderObj.id,
              itemid: orderObj.items[4].id
            };
            agent.post('/api/refunditem')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord._id).should.match(orderObj.id);
                (cord.items[4]._id).should.match(orderObj.items[4].id);
                (cord.items[4].status).should.match('rejectrefund');


                done();

              });
          });
      });
  });

  it('admin get orderlist item success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'rejectrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'rejectrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'cancelrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'cancelrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              title: '',
              currentpage: null,
              keyword: ''
            };
            agent.post('/api/getordersbyadmin')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.titles.length).should.match(8);
                (cord.items.length).should.match(0);
                // (cord.items[0].name).should.match(product.name);
                // (cord.items[0].image).should.match(product.images[0]);
                // (cord.items[0].price).should.match(product.price);
                // (cord.items[0].qty).should.match(orderObj.items[0].qty);
                // (cord.items[0].shippingtype).should.match(orderObj.items[0].shipping.ref.name);
                // (cord.items[0].shippingprice).should.match(orderObj.items[0].shipping.price);
                // (cord.items[0].amount).should.match(orderObj.items[0].amount);
                // (cord.items[0].sentdate).should.match('');
                // (cord.items[0].receivedate).should.match('');
                // (cord.items[0].canceldate).should.match('');
                // (cord.items[0].isrefund).should.match(false);
                // (cord.items[0].status).should.match('confirm');
                // (cord.items[0].rejectreason).should.match('');
                (cord.paging.length).should.match(0);


                done();

              });
          });
      });
  });

  it('admin get orderlist item confirm success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'rejectrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'rejectrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'cancelrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'cancelrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              title: 'รอจัดส่ง',
              currentpage: null,
              keyword: ''
            };
            agent.post('/api/getordersbyadmin')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.titles.length).should.match(8);
                (cord.items.length).should.match(1);
                // (cord.items[0].name).should.match(product.name);
                // (cord.items[0].image).should.match(product.images[0]);
                // (cord.items[0].price).should.match(product.price);
                // (cord.items[0].qty).should.match(orderObj.items[0].qty);
                // (cord.items[0].shippingtype).should.match(orderObj.items[0].shipping.ref.name);
                // (cord.items[0].shippingprice).should.match(orderObj.items[0].shipping.price);
                // (cord.items[0].amount).should.match(orderObj.items[0].amount);
                // (cord.items[0].sentdate).should.match('');
                // (cord.items[0].receivedate).should.match('');
                // (cord.items[0].canceldate).should.match('');
                // (cord.items[0].isrefund).should.match(false);
                // (cord.items[0].status).should.match('confirm');
                // (cord.items[0].rejectreason).should.match('');
                (cord.paging.length).should.match(1);


                done();

              });
          });
      });
  });

  it('admin search orderlist item confirm success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'rejectrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'rejectrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'cancelrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'cancelrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              title: 'รอจัดส่ง',
              currentpage: null,
              keyword: orderObj.docno
            };
            agent.post('/api/getordersbyadmin')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.titles.length).should.match(8);
                (cord.items.length).should.match(1);
                // (cord.items[0].name).should.match(product.name);
                // (cord.items[0].image).should.match(product.images[0]);
                // (cord.items[0].price).should.match(product.price);
                // (cord.items[0].qty).should.match(orderObj.items[0].qty);
                // (cord.items[0].shippingtype).should.match(orderObj.items[0].shipping.ref.name);
                // (cord.items[0].shippingprice).should.match(orderObj.items[0].shipping.price);
                // (cord.items[0].amount).should.match(orderObj.items[0].amount);
                // (cord.items[0].sentdate).should.match('');
                // (cord.items[0].receivedate).should.match('');
                // (cord.items[0].canceldate).should.match('');
                // (cord.items[0].isrefund).should.match(false);
                // (cord.items[0].status).should.match('confirm');
                // (cord.items[0].rejectreason).should.match('');
                (cord.paging.length).should.match(1);


                done();

              });
          });
      });
  });

  it('admin search orderlist item confirm success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'rejectrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'rejectrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'cancelrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'cancelrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              title: 'รอจัดส่ง',
              currentpage: null,
              keyword: orderObj.docno
            };
            agent.post('/api/getordersbyadmin')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.titles.length).should.match(8);
                (cord.items.length).should.match(1);
                // (cord.items[0].name).should.match(product.name);
                // (cord.items[0].image).should.match(product.images[0]);
                // (cord.items[0].price).should.match(product.price);
                // (cord.items[0].qty).should.match(orderObj.items[0].qty);
                // (cord.items[0].shippingtype).should.match(orderObj.items[0].shipping.ref.name);
                // (cord.items[0].shippingprice).should.match(orderObj.items[0].shipping.price);
                // (cord.items[0].amount).should.match(orderObj.items[0].amount);
                // (cord.items[0].sentdate).should.match('');
                // (cord.items[0].receivedate).should.match('');
                // (cord.items[0].canceldate).should.match('');
                // (cord.items[0].isrefund).should.match(false);
                // (cord.items[0].status).should.match('confirm');
                // (cord.items[0].rejectreason).should.match('');
                (cord.paging.length).should.match(1);


                done();

              });
          });
      });
  });

  it('admin search orderlist item confirm unsuccess', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'rejectrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'rejectrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'cancelrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'cancelrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              title: 'รอจัดส่ง',
              currentpage: null,
              keyword: 'xxxxx'
            };
            agent.post('/api/getordersbyadmin')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.titles.length).should.match(8);
                (cord.items.length).should.match(0);
                // (cord.items[0].name).should.match(product.name);
                // (cord.items[0].image).should.match(product.images[0]);
                // (cord.items[0].price).should.match(product.price);
                // (cord.items[0].qty).should.match(orderObj.items[0].qty);
                // (cord.items[0].shippingtype).should.match(orderObj.items[0].shipping.ref.name);
                // (cord.items[0].shippingprice).should.match(orderObj.items[0].shipping.price);
                // (cord.items[0].amount).should.match(orderObj.items[0].amount);
                // (cord.items[0].sentdate).should.match('');
                // (cord.items[0].receivedate).should.match('');
                // (cord.items[0].canceldate).should.match('');
                // (cord.items[0].isrefund).should.match(false);
                // (cord.items[0].status).should.match('confirm');
                // (cord.items[0].rejectreason).should.match('');
                (cord.paging.length).should.match(0);


                done();

              });
          });
      });
  });

  it('admin orderlist item refund success', function (done) {
    // Save a new Order
    var orderObj = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'confirm',
        remark: '',
        log: [{ status: 'confirm', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'sent',
        remark: '',
        log: [{ status: 'sent', created: new Date() }],
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'completed',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'completed', created: new Date() }
        ],
        remark: '',
        qty: 1,
        amount: 300,
        refid: '1111'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'cancel', created: new Date() }
        ],
        status: 'cancel',
        remark: '',
        qty: 1,
        amount: 300
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        log: [
          { status: 'reject', created: new Date() }
        ],
        status: 'reject',
        remark: 'out of stock',
        qty: 1,
        amount: 300
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    var orderObj2 = new Order({
      docno: +new Date(),
      items: [{
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'transferred',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'transferred', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'rejectrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'rejectrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }, {
        product: product,
        unitprice: 200,
        shopid: shop.id,
        shipping: {
          ref: {
            name: 'EMS'
          },
          price: 100
        },
        status: 'cancelrefund',
        remark: '',
        log: [
          { status: 'sent', created: new Date() },
          { status: 'cancelrefund', created: new Date() }
        ],
        qty: 1,
        amount: 300,
        refid: '123'
      }],
      shippingAddress: {
        name: 'Ass',
        tel: '0999999999',
        address: {
          address: 'address',
          district: 'districe',
          subdistrict: 'subdistrict',
          province: 'province',
          postcode: '12150'
        },
        location: {
          lat: 19999,
          lng: 20000
        }
      },
      coupon: {
        code: 'AC-100',
        discount: 100
      },
      payment: {
        paymenttype: 'Internal Banking',
        creditno: '',
        creditname: '',
        expdate: '',
        creditcvc: ''
      },
      omiseToken: '',
      qty: 1,
      amount: 200,
      shippingamount: 100,
      discountamount: 100,
      totalamount: 200,
      omiseresponse: {},
      user: user
    });

    orderObj.save(function (err) {
      // console.log(err);
      orderObj2.save(function (err) {
        // console.log(err);
      });
    });
    agent.get('/api/orders')
      // .set('authorization', 'Bearer ' + token)
      .end(function (order2Err, order2Res) {
        // Handle signin error
        if (order2Err) {
          return done(order2Err);
        }
        var ord2 = order2Res.body;
        (ord2.length).should.match(2);
        // (ord2[0].items.length).should.match(5);
        // (ord2[0].items[0].status).should.match('confirm');
        // (ord2[0].items[0].log.length).should.match(1);
        // (ord2[0].items[0].log[0].status).should.match('confirm');
        // (ord2[0].items[0].product.name).should.match('confirm');
        agent.post('/api/auth/signin')
          .send(credentials3)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var item = {
              title: 'คืนเงินแล้ว',
              currentpage: null,
              keyword: ''
            };
            agent.post('/api/getordersbyadmin')
              .set('authorization', 'Bearer ' + signinRes.body.loginToken)
              .send(item)
              .end(function (customergetordersErr, customergetordersRes) {
                // Handle signin error
                if (customergetordersErr) {
                  return done(customergetordersErr);
                }
                var cord = customergetordersRes.body;
                // (cord).should.match(orderObj.id);
                (cord.titles.length).should.match(8);
                (cord.items.length).should.match(2);
                // (cord.items[0].name).should.match(product.name);
                // (cord.items[0].image).should.match(product.images[0]);
                // (cord.items[0].price).should.match(product.price);
                // (cord.items[0].qty).should.match(orderObj.items[0].qty);
                // (cord.items[0].shippingtype).should.match(orderObj.items[0].shipping.ref.name);
                // (cord.items[0].shippingprice).should.match(orderObj.items[0].shipping.price);
                // (cord.items[0].amount).should.match(orderObj.items[0].amount);
                // (cord.items[0].sentdate).should.match('');
                // (cord.items[0].receivedate).should.match('');
                // (cord.items[0].canceldate).should.match('');
                // (cord.items[0].isrefund).should.match(false);
                // (cord.items[0].status).should.match('confirm');
                // (cord.items[0].rejectreason).should.match('');
                (cord.paging.length).should.match(1);


                done();

              });
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Product.remove().exec(function () {
        Shop.remove().exec(function () {
          Coupon.remove().exec(function () {
            pushNotification.remove().exec(function () {
              Order.remove().exec(done);
            });
          });
        });
      });
    });
  });
});
