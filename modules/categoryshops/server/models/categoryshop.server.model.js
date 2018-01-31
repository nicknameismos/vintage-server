'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Categoryshop Schema
 */
var CategoryshopSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Categoryshop name',
    trim: true
  },
  image: {
    type: String,
    default: './assets/imgs/Catagory/cat20.png'
  },
  imageen: {
    type: String,
    default: './assets/imgs/Catagory/cat20.png'
  },
  seq: {
    type: Number,
    default: 0
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

mongoose.model('Categoryshop', CategoryshopSchema);
