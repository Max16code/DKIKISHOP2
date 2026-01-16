// 

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
    // Track purchased stock for potential rollback
    purchasedStock: Number // Stock at time of purchase (before decrement)
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
  
  // Payment Information (Paystack specific)
  reference: {
    type: String,
    // unique: true,
    sparse: true // Allows null/multiple nulls
  },
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

// ✅ Auto-update updatedAt timestamp
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// ✅ Generate unique shopId if not provided
orderSchema.pre('save', async function(next) {
  if (!this.shopId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.shopId = `ORD-${timestamp}-${random}`;
  }
  next();
});

// ✅ Static method to create order with stock validation
orderSchema.statics.createWithStockValidation = async function(orderData, session = null) {
  const Product = mongoose.model('Product');
  
  const options = session ? { session } : {};
  
  try {
    // Validate stock for each item
    for (const item of orderData.items) {
      const product = await Product.findById(item.productId, null, options);
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      // Validate order quantity vs product stock
      if (!product.isAvailable || product.stock < item.quantity) {
        throw new Error(`"${product.title}" is ${product.stock > 0 ? `only ${product.stock} available` : 'out of stock'}`);
      }
      
      // Store purchased stock (for record keeping)
      item.purchasedStock = product.stock;
    }
    
    // Create the order
    const order = new this(orderData);
    await order.save(options);
    
    return order;
    
  } catch (error) {
    throw error;
  }
};

// ✅ Static method to confirm payment and update stock
orderSchema.statics.confirmPayment = async function(reference, paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const Product = mongoose.model('Product');
    
    // Find the order
    const order = await this.findOne({ reference }).session(session);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Only process if payment is pending
    if (order.paymentStatus !== 'pending') {
      throw new Error(`Order payment status is already ${order.paymentStatus}`);
    }
    
    // Update payment status
    order.paymentStatus = paymentData.status === 'success' ? 'successful' : 'failed';
    order.status = paymentData.status === 'success' ? 'confirmed' : 'pending';
    
    if (paymentData.status === 'success') {
      order.paidAt = new Date();
      
      // ✅ CRITICAL: Decrement product stock for each item
      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        // Check stock one more time (race condition protection)
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.title}". Available: ${product.stock}, Ordered: ${item.quantity}`);
        }
        
        // ✅ Decrement product stock (this is PRODUCT stock, not order quantity)
        product.stock -= item.quantity;
        product.quantity = product.stock; // Keep the quantity field in sync
        
        // Update product availability
        if (product.stock <= 0) {
          product.isAvailable = false;
          product.stock = 0;
          product.quantity = 0;
        }
        
        // Store original stock in order item for record
        item.purchasedStock = product.stock + item.quantity; // Stock before decrement
        
        await product.save({ session });
      }
    }
    
    await order.save({ session });
    await session.commitTransaction();
    
    return order;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Static method to validate cart before payment
orderSchema.statics.validateCart = async function(cartItems) {
  const validationResults = [];
  let isCartValid = true;
  let totalAmount = 0;
  
  const Product = mongoose.model('Product');
  
  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.productId);
    
    if (!product) {
      validationResults.push({
        productId: cartItem.productId,
        valid: false,
        message: 'Product not found'
      });
      isCartValid = false;
      continue;
    }
    
    if (!product.isAvailable) {
      validationResults.push({
        productId: cartItem.productId,
        productTitle: product.title,
        valid: false,
        message: 'Product is not available'
      });
      isCartValid = false;
      continue;
    }
    
    // ✅ Validate order quantity vs product stock
    const orderQuantity = cartItem.quantity || 1; // How many they want to buy
    
    if (product.stock < orderQuantity) {
      validationResults.push({
        productId: cartItem.productId,
        productTitle: product.title,
        valid: false,
        message: `Only ${product.stock} item${product.stock !== 1 ? 's' : ''} available`,
        availableStock: product.stock,
        requestedQuantity: orderQuantity
      });
      isCartValid = false;
    } else {
      validationResults.push({
        productId: cartItem.productId,
        productTitle: product.title,
        valid: true,
        price: product.price,
        stock: product.stock, // Current product stock
        maxQuantity: product.stock, // Maximum they can order
        orderQuantity: orderQuantity // How many they want
      });
      
      // Calculate subtotal
      totalAmount += product.price * orderQuantity;
    }
  }
  
  return {
    isValid: isCartValid,
    validationResults,
    totalAmount,
    subtotal: totalAmount,
    shippingFee: 0,
    grandTotal: totalAmount
  };
};

// ✅ Instance method to cancel order and restore stock
orderSchema.methods.cancelOrder = async function(reason = '') {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Only cancel pending or confirmed orders
    if (this.status === 'shipped' || this.status === 'delivered') {
      throw new Error('Cannot cancel shipped or delivered orders');
    }
    
    const Product = mongoose.model('Product');
    
    // Restore stock if payment was successful
    if (this.paymentStatus === 'successful') {
      for (const item of this.items) {
        const product = await Product.findById(item.productId).session(session);
        
        if (product) {
          // ✅ Restore the purchased quantity to PRODUCT stock
          product.stock += item.quantity;
          product.quantity = product.stock; // Keep in sync
          
          // If stock was 0 and now has items, make available
          if (product.stock > 0 && !product.isAvailable) {
            product.isAvailable = true;
          }
          
          await product.save({ session });
        }
      }
    }
    
    // Update order status
    this.status = 'cancelled';
    this.paymentStatus = this.paymentStatus === 'successful' ? 'refunded' : 'failed';
    this.notes = this.notes ? `${this.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
    
    await this.save({ session });
    await session.commitTransaction();
    
    return this;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Instance method to check if order can be shipped
orderSchema.methods.canShip = function() {
  return this.paymentStatus === 'successful' && 
         this.status === 'confirmed' && 
         this.items.every(item => item.quantity > 0);
};

// ✅ Query helper for available orders
orderSchema.query.available = function() {
  return this.where({ status: { $nin: ['cancelled'] } });
};

orderSchema.query.pending = function() {
  return this.where({ status: 'pending', paymentStatus: 'pending' });
};

orderSchema.query.paid = function() {
  return this.where({ paymentStatus: 'successful' });
};

// ✅ Indexes for better performance
orderSchema.index({ reference: 1 }, { unique: true, sparse: true });
orderSchema.index({ shopId: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.productId': 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);