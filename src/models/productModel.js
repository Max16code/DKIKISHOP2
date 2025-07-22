// src/models/productModel.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  sizes: [String],
  category: String,
});

// Prevent model overwrite on hot reload
export default mongoose.models?.Product || mongoose.model("Product", ProductSchema);
