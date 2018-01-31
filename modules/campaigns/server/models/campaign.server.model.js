'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Campaign Schema
 */
var CampaignSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Campaign name',
    trim: true
  },
  detail: {
    type: String
  },
  coin_give: {
    type: Number,
    required: 'Please fill Campaign coingive'
  },
  effectivedatestart: {
    type: Date,
    required: 'Please fill Campaign effectivedatestart'
  },
  effectivedateend: {
    type: Date,
    required: 'Please fill Campaign effectivedateend'
  },
  status: {
    type: Boolean,
    required: 'Please fill Campaign status'
  },
  image: {
    type: String,
    required: 'Please fill Campaign image'
  },
  remark: {
    type: String
  },
  type: {
    type: Schema.ObjectId,
    ref: 'Campaignmaster'
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

mongoose.model('Campaign', CampaignSchema);
