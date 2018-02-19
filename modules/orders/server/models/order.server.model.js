'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
  docno: {
    type: String,
    unique: true
  },
  items: {
    type: [{
      product: {
        type: Schema.ObjectId,
        ref: 'Product'
      },
      shopid: {
        type: String
      },
      unitprice: {
        type: Number
      },
      shipping: {
        ref: {
          name: {
            type: String
          }
        },
        price: {
          type: Number
        }
      },
      status: {
        type: String,
        enum: ['confirm', 'sent', 'completed', 'cancel', 'admincancel', 'reject', 'transferred', 'rejectrefund', 'cancelrefund', 'admincancelrefund'],
        default: 'confirm'
      },
      remark: {
        type: String
      },
      qty: {
        type: Number
      },
      amount: {
        type: Number
      },
      log: {
        type: [{
          status: {
            type: String
          },
          created: {
            type: Date,
            default: Date.now
          }
        }]
      },
      refid: {
        type: String
      }
    }]
  },
  shippingAddress: {
    name: {
      type: String
    },
    tel: {
      type: String
    },
    address: {
      address: {
        type: String
      },
      district: {
        type: String
      },
      subdistrict: {
        type: String
      },
      province: {
        type: String
      },
      postcode: {
        type: String
      }
    },
    location: {
      lat: {
        type: Number
      },
      lng: {
        type: Number
      }
    }
  },
  coupon: {
    code: {
      type: String
    },
    discount: {
      type: String
    }
  },
  payment: {
    paymenttype: {
      type: String
    },
    creditno: {
      type: String
    },
    creditname: {
      type: String
    },
    expdate: {
      type: String
    },
    creditcvc: {
      type: String
    }
  },
  omiseToken: {
    type: String
  },
  qty: {
    type: Number
  },
  amount: {
    type: Number
  },
  shippingamount: {
    type: Number
  },
  discountamount: {
    type: Number
  },
  totalamount: {
    type: Number
  },
  omiseresponse: {},
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Order', OrderSchema);
