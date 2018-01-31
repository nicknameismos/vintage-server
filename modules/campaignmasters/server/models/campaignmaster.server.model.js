'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Campaignmaster Schema
 */
var CampaignmasterSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Campaignmaster name',
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

mongoose.model('Campaignmaster', CampaignmasterSchema);
