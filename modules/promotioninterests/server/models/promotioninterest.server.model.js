'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Promotioninterest Schema
 */
var PromotioninterestSchema = new Schema({
  promotioninterest: {
    type: String,
    default: '',
    required: 'Please fill Promotioninterest name',
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

mongoose.model('Promotioninterest', PromotioninterestSchema);
