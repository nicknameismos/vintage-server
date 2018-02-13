'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Notification Schema
 */
var NotificationSchema = new Schema({
  title: {
    type: String
  },
  detail: {
    type: String
  },
  userowner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  isread: {
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

mongoose.model('Notification', NotificationSchema);
