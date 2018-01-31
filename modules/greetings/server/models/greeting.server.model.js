'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Greeting Schema
 */
var GreetingSchema = new Schema({
  images: [{
    type: String,
    required: 'Please fill images',
    trim: true
  }],
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Greeting', GreetingSchema);
