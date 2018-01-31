'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Shopinterest Schema
 */
var ShopinterestSchema = new Schema({
  shopinterest: {
    type: String,
    default: '',
    required: 'Please fill Shopinterest name'
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

mongoose.model('Shopinterest', ShopinterestSchema);
