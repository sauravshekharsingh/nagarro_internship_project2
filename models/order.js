const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orders: [
      {
        products: [
          {
            pid: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Product',
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
            },
          },
        ],
        date: {
          type: Date,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        modeOfPayment: {
          type: String,
          default: 'pod',
        },
        status: {
          type: String,
          default: 'In process. Will be delivered shortly.',
        },
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
