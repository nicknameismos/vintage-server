'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Shop Schema
 */
var ShopSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Shop name',
    unique: true,
    trim: true
  },
  name_eng: {
    type: String,
    default: ''
  },
  detail: {
    type: String,
    default: ''
  },
  address: {
    addressdetail: String,
    address: String,
    subdistinct: String,
    distinct: String,
    province: String,
    postcode: String,
    lat: String,
    lng: String,
  },
  tel: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: '',
  },
  facebook: {
    type: String,
    default: ''
  },
  line: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0
  },
  othercontact: {
    type: String,
    default: ''
  },
  promoteimage: {
    type: [String],
    default: []
  },
  coverimage: {
    type: String,
    default: ''
  },
  isactiveshop: {
    type: Boolean,
    default: false
  },
  issendmail: {
    type: Boolean,
    default: false
  },
  importform: {
    type: String,
    default: 'manual'
  },
  items: {
    type: [{
      cate: {
        type: Schema.ObjectId,
        ref: 'Categoryproduct'
      },
      products: {
        type: [{
          type: Schema.ObjectId,
          ref: 'Product'
        }],
        default: []
      }
    }]
  },
  times: {
    type: [{
      description: String,
      timestart: String,
      timeend: String,
      days: [String]
    }]
  },
  categories: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Categoryshop'
    }]
  },
  shopowner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  ishave: {
    type: Boolean,
  },
  islaunch: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  isAds: {
    type: Boolean,
    default: false
  }
});

mongoose.model('Shop', ShopSchema);
