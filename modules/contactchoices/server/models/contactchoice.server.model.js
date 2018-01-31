'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Contactchoice Schema
 */
var ContactchoiceSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Contactchoice name',
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

mongoose.model('Contactchoice', ContactchoiceSchema);
