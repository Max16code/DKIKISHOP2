// scripts/fixSizes.js
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables (fallback)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env.local');

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (err) {
  // ignore – maybe using --env-file
}

import connectDB from '../src/lib/mongodb.js';
import Product from '../src/models/productModel.js';

async function fixSizes() {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB');

    // 1️⃣ Find all products where sizes is NOT an array of objects
    const products = await Product.find({
      $or: [
        { sizes: { $not: { $type: 'array' } } },                       // not an array at all
        { $expr: { $eq: [{ $type: { $arrayElemAt: ['$sizes', 0] } }, 'object'] } } // but objects are invalid? Actually objects are allowed if they have size/stock
      ]
    });

    console.log(`🔍 Found ${products.length} products with potential size issues.`);

    let fixedCount = 0;
    for (const product of products) {
      let newSizes = [];
      const oldSizes = product.sizes;

      // Case 1: sizes is an object with numeric keys like { '0': '2', '1': '6', stock: 0, _id: ... }
      if (oldSizes && typeof oldSizes === 'object' && !Array.isArray(oldSizes)) {
        const keys = Object.keys(oldSizes).filter(k => !isNaN(parseInt(k)));
        if (keys.length) {
          // Extract size values from numeric keys
          const sizeValues = keys.map(k => oldSizes[k]).filter(v => typeof v === 'string');
          if (sizeValues.length) {
            // Distribute total stock evenly (if totalStock is available)
            const totalStock = product.stock ?? product.quantity ?? sizeValues.length;
            const perSize = Math.max(1, Math.floor(totalStock / sizeValues.length));
            newSizes = sizeValues.map(size => ({ size, stock: perSize }));
          }
        }
      }
      // Case 2: sizes is an array but contains objects with numeric keys or missing size/stock
      else if (Array.isArray(oldSizes) && oldSizes.length > 0) {
        if (typeof oldSizes[0] === 'string') {
          // Already an array of strings – convert
          const totalStock = product.stock ?? product.quantity ?? 1;
          const perSize = Math.max(1, Math.floor(totalStock / oldSizes.length));
          newSizes = oldSizes.map(size => ({ size, stock: perSize }));
        } else if (typeof oldSizes[0] === 'object') {
          // Already objects – just ensure they have size and stock
          newSizes = oldSizes.map(s => ({
            size: s.size || (s._id ? 'OS' : 'Unknown'),
            stock: typeof s.stock === 'number' ? s.stock : 1
          }));
        }
      }

      if (newSizes.length === 0) {
        // Fallback: create one generic size
        newSizes = [{ size: 'OS', stock: product.stock ?? product.quantity ?? 1 }];
      }

      // Update product
      product.sizes = newSizes;
      product.stock = newSizes.reduce((sum, s) => sum + s.stock, 0);
      product.isAvailable = product.stock > 0;

      // Remove any leftover _id inside sizes (Mongoose will handle)
      await product.save();
      fixedCount++;
      console.log(`✅ Fixed product ${product._id} → ${newSizes.map(s => `${s.size}:${s.stock}`).join(', ')}`);
    }

    console.log(`🎉 Done! Fixed ${fixedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixSizes();