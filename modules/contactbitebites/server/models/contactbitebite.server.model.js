'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Contactbitebite Schema
 */
var ContactbitebiteSchema = new Schema({
  title: {
    type: Schema.ObjectId,
    ref: 'Contactchoice'
  },
  description: {
    type: String
  },
  image: {
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

mongoose.model('Contactbitebite', ContactbitebiteSchema);
