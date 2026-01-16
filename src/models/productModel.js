// 

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Old single image field (keep for backward compatibility)
  image: {
    type: String,
  },
  // New multiple images field
  images: {
    type: [String],
    required: true,
  },
  sizes: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: ['jeans', 'shirts', 'skirts', 'activewears', 'shorts', 'accessories'], // Add validation
  },
  // Renamed 'quantity' to 'stock' for clarity (but keep quantity for now)
  quantity: {
    type: Number,
    required: true, // Make required
    default: 0,
    min: 0,
  },
  // Add stock alias for consistency
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  // Add metadata fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // For featured products on home page
  isFeatured: {
    type: Boolean,
    default: false,
  }
});

// ✅ Middleware: Sync stock with quantity and update isAvailable
ProductSchema.pre("save", function (next) {
  // Sync stock with quantity if stock is not set
  if (this.stock === undefined) {
    this.stock = this.quantity;
  }
  
  // Update availability based on stock
  if (this.stock <= 0) {
    this.isAvailable = false;
    this.stock = 0;
    this.quantity = 0; // Keep quantity in sync
  } else {
    this.isAvailable = true;
    this.quantity = this.stock; // Keep quantity in sync
  }
  
  this.updatedAt = new Date();
  next();
});

// ✅ Static method to safely decrement stock
ProductSchema.statics.decrementStock = async function(productId, quantity) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const product = await this.findById(productId).session(session);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
    }
    
    // Update stock and quantity
    product.stock -= quantity;
    product.quantity = product.stock; // Keep in sync
    
    // Save the product
    await product.save({ session });
    
    await session.commitTransaction();
    return product;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function() {
  return this.stock > 0 && this.isAvailable;
});

// ✅ Index for better query performance
ProductSchema.index({ category: 1, isAvailable: 1, stock: 1 });
ProductSchema.index({ isAvailable: 1, stock: 1 });

// ✅ Prevent model overwrite on hot reload
export default mongoose.models?.Product || mongoose.model("Product", ProductSchema);