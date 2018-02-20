'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Bid Schema
 */
var BidSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Bid name',
    trim: true
  },
  detail: {
    type: String
  },
  price: {
    type: Number
  },
  startprice: {
    type: Number
  },
  bidprice: {
    type: Number,
    required: 'Please fill Bid bidprice'
  },
  starttime: {
    type: Date
  },
  endtime: {
    type: Date
  },
  image: {
    type: [String],
    required: 'Please fill Bid image'
  },
  userbid: {
    type: [{
      user: {
        type: Schema.ObjectId,
        ref: 'User'
      },
      created: {
        type: Date,
        default: Date.now
      },
      bidprice: {
        type: Number
      }
    }]
  },
  status: {
    type: String,
    enum: ['active', 'end', 'paid'],
    default: 'active'
  },
  shippings: {
    type: [{
      ref: {
        type: Schema.ObjectId,
        ref: 'Shippingmaster'
      },
      price: {
        type: Number
      }
    }]
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

mongoose.model('Bid', BidSchema);
