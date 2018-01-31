'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Benefitsetting Schema
 */
var BenefitsettingSchema = new Schema({
  name: {
    type: String,
    enum: ['newreg', 'login', 'bill'],
    required: 'Please fill Benefitsetting name',
  },
  title: String,
  remark: String,
  image: String,
  description:{
    type: String,
    default: ''
  },
  items:{
    type: [{
      benefittype: {
        type: String,
        enum: ['coin']
      },
      volume: Number
    }]
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

mongoose.model('Benefitsetting', BenefitsettingSchema);
