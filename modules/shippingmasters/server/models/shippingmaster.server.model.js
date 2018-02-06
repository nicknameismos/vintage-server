'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Shippingmaster Schema
 */
var ShippingmasterSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Shippingmaster name',
    trim: true
  },
  detail: {
    type: String
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

mongoose.model('Shippingmaster', ShippingmasterSchema);
