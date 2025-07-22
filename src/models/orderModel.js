import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  email: String,
  items: Array,
  total: Number,
  reference: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Order || mongoose.model('Order', orderSchema)
