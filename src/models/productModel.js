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
    enum: [
      'blazers', 
      'shirts', 
      'skirts', 
      'dresses', 
      'activewears', 
      'jeans', 
      'shorts', 
      'accessories'
    ],
  },

  // ── NEW: Shop association (required for dynamic shopId) ─────────────────────
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',                // assumes you have a Shop model
    required: true,
    index: true,
  },

  // ── Stock / Inventory Management ───────────────────────────────────────────
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },

  // Metadata fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

// ── Pre-save middleware ────────────────────────────────────────────────────────
ProductSchema.pre("save", function (next) {
  // Sync stock ↔ quantity
  if (this.stock === undefined || this.stock === null) {
    this.stock = this.quantity;
  } else {
    this.quantity = this.stock; // always keep them in sync
  }

  // Update availability
  if (this.stock <= 0) {
    this.isAvailable = false;
    this.stock = 0;
    this.quantity = 0;
  } else {
    this.isAvailable = true;
  }

  this.updatedAt = new Date();
  next();
});

// ── Static method: atomic stock decrement (used in webhook) ────────────────────
ProductSchema.statics.decrementStock = async function (productId, quantity) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await this.findById(productId).session(session);

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock for product ${productId}. ` +
        `Available: ${product.stock}, Requested: ${quantity}`
      );
    }

    // Atomic update
    product.stock -= quantity;
    product.quantity = product.stock; // keep sync
    product.isAvailable = product.stock > 0;

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

// ── Virtual: inStock checker ──────────────────────────────────────────────────
ProductSchema.virtual('inStock').get(function () {
  return this.stock > 0 && this.isAvailable;
});

// ── Indexes ────────────────────────────────────────────────────────────────────
ProductSchema.index({ category: 1, isAvailable: 1, stock: 1 });
ProductSchema.index({ isAvailable: 1, stock: 1 });
ProductSchema.index({ shopId: 1, isAvailable: 1 });      // useful for shop-specific listings

// Prevent model overwrite during hot reload
export default mongoose.models?.Product || mongoose.model("Product", ProductSchema);