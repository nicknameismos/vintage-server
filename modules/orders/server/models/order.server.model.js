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
  items: {
    type: [{
      product: {
        name: {
          type: String
        },
        price: {
          type: Number
        },
        images: {
          type: [String]
        }
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
        enum: ['confirm', 'sent', 'completed', 'cancel', 'reject', 'transferred', 'refund'],
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
