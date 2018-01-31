'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Categoryproduct Schema
 */
var CategoryproductSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Categoryproduct name',
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  priority: {
    type: Number
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
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

mongoose.model('Categoryproduct', CategoryproductSchema);
