'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Ad Schema
 * "image": "./assets/imgs/ads/ads1.png",
      "isvideo": true,
      "videoid": "###"
 */
var AdSchema = new Schema({
  name: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: '',
    trim: true
  },
  isvideo: {
    type: Boolean,
    default: false
  },
  videoid: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: 'www.bitebite.com'
  },
  effectivedatestart: {
    type: Date
  },
  effectivedateend: {
    type: Date
  },
  status: {
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

mongoose.model('Ad', AdSchema);
