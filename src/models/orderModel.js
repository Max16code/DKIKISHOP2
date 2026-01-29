import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  // ---------------- Customer Information ----------------
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },

  // ---------------- Shipping Address ----------------
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Nigeria',
    },
  },

  // ---------------- Order Items ----------------
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: { type: String, required: true },
    size: String,
    price: { type: Number, required: true, min: 0 },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1, 
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number'
      }
    },
    image: String,
    purchasedStock: Number // stock at time of purchase
  }],

  // ---------------- Order Totals ----------------
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },

  // ---------------- Payment & Order Info ----------------
  reference: { type: String, unique: true, sparse: true },
  paymentMethod: { type: String, default: 'paystack' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'successful', 'failed', 'refunded'],
    default: 'pending'
  },
  paidAt: Date,

  // ---------------- Shop / Order Tracking ----------------
  shopId: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  deliveryNotes: String,

  // ---------------- Metadata ----------------
  notes: String,
  ipAddress: String,
  userAgent: String,

  // ---------------- Timestamps ----------------
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  shippedAt: Date,
  deliveredAt: Date,
})

// ===== Pre-save hooks =====
// Auto-update updatedAt timestamp
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate unique shopId if not provided
orderSchema.pre('save', async function(next) {
  if (!this.shopId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.shopId = `ORD-${timestamp}-${random}`;
  }
  next();
});

// ===== Indexes =====
orderSchema.index({ reference: 1 }, { unique: true, sparse: true });
orderSchema.index({ shopId: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.productId': 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
