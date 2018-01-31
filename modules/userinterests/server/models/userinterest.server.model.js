'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Userinterest Schema
 */
var UserinterestSchema = new Schema({
  shopinterest: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Shopinterest'
    }],
  },
  promotioninterest: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Promotioninterest'
    }],
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

mongoose.model('Userinterest', UserinterestSchema);
