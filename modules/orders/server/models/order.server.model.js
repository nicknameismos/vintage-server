'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Order name',
    trim: true
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
  },
  items: {
    type: [{
      product: {
        type: [{
          type: Schema.ObjectId,
          ref: 'Product'
        }]
      },
      qty: Number,
      amount: Number
    }]
  },
  shippingAddress: {
    name: String,
    tel: String,
    address: String,
    addressDetail: String,
    location: {
      lat: String,
      lng: String
    }
  },
  coupon: {
    code: String,
    discount: Number,
  },
  qty: Number,
  amount: Number,
  discount: Number,
  distance: String,
  payment: {
    paymenttype: String,
    creditno: String,
    creditname: String,
    expdate: String,
    creditcvc: String
  },
  omiseresponse: {},
  skootarresponse: {},
  estimateprice: {},
  netamount: Number,
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Order', OrderSchema);
