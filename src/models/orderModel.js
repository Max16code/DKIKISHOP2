import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  // Customer Information
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: String,
  customerName: String,
  
  // Shipping Address
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Nigeria',
    },
    postalCode: String,
  },
  
  // Order Items (Enhanced)
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    size: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
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
    purchasedStock: Number // Stock at time of purchase
  }],
  
  // Order Totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // // Payment & Order Info
  // reference: {
  //   type: String,
  //   sparse: true // Allows null/multiple nulls
  // },
  paymentMethod: {
    type: String,
    default: 'paystack'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'successful', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Shop/Store Information
  shopId: {
    type: String,
    required: true,
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Delivery/Tracking
  trackingNumber: String,
  deliveryNotes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  
  // Metadata
  notes: String,
  ipAddress: String,
  userAgent: String,
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

// ===== Static & instance methods =====
// ... Keep all your createWithStockValidation, confirmPayment, validateCart, cancelOrder, canShip methods here unchanged ...

// ===== Indexes (placed AFTER schema declaration) =====
orderSchema.index({ reference: 1 }, { unique: true, sparse: true });
orderSchema.index({ shopId: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.productId': 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
