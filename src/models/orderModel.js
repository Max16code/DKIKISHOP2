// models/ordermodel.js

import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  email: String, // optional — okay to leave if not always populated
  items: Array,  // each item should ideally have title, size, price, quantity
  totalAmount: Number, // updated from 'total' (optional)
  reference: String, // from Paystack
  shopId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Order || mongoose.model('Order', orderSchema)
