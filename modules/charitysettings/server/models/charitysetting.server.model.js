'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Charitysetting Schema
 */
var CharitysettingSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Charitysetting name',
    trim: true
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

mongoose.model('Charitysetting', CharitysettingSchema);
