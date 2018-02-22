'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Coupon Schema
 */
var CouponSchema = new Schema({
  code: {
    type: String,
    default: '',
    required: 'Please fill Coupon Code',
    trim: true
  },
  price: {
    type: Number,
    required: 'Please fill Coupon Price'
  },
  message: {
    type: String,
    required: 'Please fill Coupon message'
  },
  type: {
    type: String,
    enum: ['single', 'multi'],
    required: 'Please provide at least one type'
  },
  owner: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  startdate: {
    type: Date
  },
  enddate: {
    type: Date
  },
  useruse: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Coupon', CouponSchema);
