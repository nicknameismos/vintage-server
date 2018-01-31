'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Hotprice Schema
 */
var HotpriceSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Hotprice name',
    trim: true
  },
  image: {
    type: String,
    default: './assets/imgs/hot_price/hotprice1.png',
    required: 'Please fill Hotprice image',
  },
  effectivedatestart:{
    type: Date
  },
  effectivedateend:{
    type: Date
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop',
    required: 'Please fill Hotprice shop',
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Hotprice', HotpriceSchema);
