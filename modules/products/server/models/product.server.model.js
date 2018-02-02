'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Product Schema
 */
var ProductSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Product name',
    trim: true
  },
  detail: {
    type: String
  },
  price: {
    type: Number
  },
  priorityofcate: {
    type: Number
  },
  images: {
    type: [String]
  },
  categories: {
    type: Schema.ObjectId,
    ref: 'Categoryproduct'
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
  },
  promotionprice: {
    type: Number
  },
  issale: {
    type: Boolean,
    default: true
  },
  ispromotionprice: {
    type: Boolean,
    default: false
  },
  isrecommend: {
    type: Boolean,
    default: false
  },
  startdate: {
    type: Date
  },
  expiredate: {
    type: Date
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

mongoose.model('Product', ProductSchema);
