'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Review Schema
 */
var ReviewSchema = new Schema({
  title: {
    type: String,
    default: '',
    required: 'Please fill Review title',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String,
    default: '',
    required: 'Please fill Review image',
  },
  likes: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }]
  },
  active: {
    type: Boolean,
    default: true
  },
  iscoin: {
    type: Boolean,
    default: false
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

mongoose.model('Review', ReviewSchema);
