'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Coinbalance Schema
 */
var CoinbalanceSchema = new Schema({
  name: {
    type: String,
    required: 'Please fill Coinbalance name',
    enum: ['newreg', 'login', 'bill', 'reward', 'share'],
  },
  balancetype:{
    type: String,
    required: 'Please fill Coinbalance balancetype',
    enum: ['in', 'out'],
  },
  volume: {
    type: Number,
    required: 'Please fill Coinbalance volume',
  },
  refbenefit:{
    type: Schema.ObjectId,
    ref: 'Benefitsetting'
  },
  refuser:{
    type: Schema.ObjectId,
    ref: 'User'
  },
  refcharity:{
    type: Schema.ObjectId,
    ref: 'Charitysetting'
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

mongoose.model('Coinbalance', CoinbalanceSchema);
