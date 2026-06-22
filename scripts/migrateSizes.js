// scripts/migrateSizes.js
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Optional: load .env.local manually (though you use --env-file, this is a fallback)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env.local');

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  console.log('✅ Environment loaded from .env.local');
} catch (err) {
  // ignore if not found – maybe using --env-file
  console.log('⚠️ No .env.local found, relying on --env-file or system environment');
}

import connectDB from '../src/lib/mongodb.js';
import Product from '../src/models/productModel.js';

async function migrate() {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB');

    // Find products that still have string-based sizes (old format)
    const products = await Product.find({
      $expr: {
        $and: [
          { $isArray: "$sizes" },
          { $eq: [{ $type: { $arrayElemAt: ["$sizes", 0] } }, "string"] }
        ]
      }
    });

    console.log(`📦 Found ${products.length} products to migrate.`);
    let updated = 0;
    let categoryUpdates = 0;

    for (const product of products) {
      // 1. Fix category if needed
      if (product.category === 'shirts') {
        product.category = 'tops';
        categoryUpdates++;
        console.log(`🔄 Updating category for ${product._id}: shirts → tops`);
      }

      // 2. Convert sizes
      const oldSizes = product.sizes; // e.g., ['S', 'M', 'L']
      const totalStock = product.stock ?? product.quantity ?? 1;
      const perSizeStock = Math.max(1, Math.floor(totalStock / oldSizes.length));

      const newSizes = oldSizes.map(size => ({
        size,
        stock: perSizeStock
      }));

      product.sizes = newSizes;
      product.stock = newSizes.reduce((sum, s) => sum + s.stock, 0);
      product.isAvailable = product.stock > 0;

      await product.save();
      updated++;
    }

    console.log(`🎉 Migration completed!`);
    console.log(`   - ${updated} products had their sizes updated.`);
    if (categoryUpdates) {
      console.log(`   - ${categoryUpdates} products had category changed from "shirts" to "tops".`);
    } else {
      console.log(`   - No category changes needed.`);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();