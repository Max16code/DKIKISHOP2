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
  image: {
    type: String,
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
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true, // ✅ Automatically becomes false when quantity = 0
  },
})

// ✅ Middleware: Automatically set isAvailable = false if quantity hits 0
ProductSchema.pre("save", function (next) {
  if (this.quantity <= 0) {
    this.isAvailable = false
    this.quantity = 0
  } else {
    this.isAvailable = true
  }
  next()
})

// ✅ Prevent model overwrite on hot reload
export default mongoose.models?.Product || mongoose.model("Product", ProductSchema)
