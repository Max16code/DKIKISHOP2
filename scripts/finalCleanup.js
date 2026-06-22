// scripts/finalCleanup.js
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env.local');

// Load .env.local
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
  console.log('✅ Loaded .env.local');
} catch (err) {
  console.log('⚠️ Using --env-file or system environment');
}

import connectDB from '../src/lib/mongodb.js';
import Product from '../src/models/productModel.js';

async function finalCleanup() {
  await connectDB();
  console.log('📦 Connected to MongoDB');

  const products = await Product.find({});
  console.log(`🔍 Found ${products.length} products.`);

  let updated = 0;
  for (const p of products) {
    // 1. Normalize sizes to an array of strings
    let sizeStrings = [];
    let totalStock = p.stock ?? p.quantity ?? 0;

    const sizesField = p.sizes;
    if (Array.isArray(sizesField)) {
      if (sizesField.length > 0 && typeof sizesField[0] === 'string') {
        // Already correct
        sizeStrings = sizesField;
        // If we have totalStock from the root, keep it; otherwise, infer from length? We'll trust root stock.
      } else if (sizesField.length > 0 && typeof sizesField[0] === 'object') {
        // Object array: each has { size, stock }
        sizeStrings = sizesField.map(s => s.size).filter(Boolean);
        totalStock = sizesField.reduce((sum, s) => sum + (s.stock || 0), 0);
      } else {
        // Empty array: nothing to do
        sizeStrings = [];
      }
    } else if (sizesField && typeof sizesField === 'object') {
      // Object with numeric keys like { '0': 'S', '1': 'M', stock: 0, _id: ... }
      const keys = Object.keys(sizesField).filter(k => !isNaN(parseInt(k)) && typeof sizesField[k] === 'string');
      if (keys.length) {
        sizeStrings = keys.map(k => sizesField[k]);
        // If there's a root-level stock, use it; otherwise, default to number of sizes
        totalStock = totalStock || sizeStrings.length;
      } else {
        // Something else, maybe empty object
        sizeStrings = [];
      }
    } else {
      // sizes is undefined, null, or other
      sizeStrings = [];
    }

    // 2. If we have no sizes but stock > 0, create a default "OS" size
    if (sizeStrings.length === 0 && totalStock > 0) {
      sizeStrings = ['OS'];
    }

    // 3. Ensure totalStock is at least 1 if we have any sizes
    if (sizeStrings.length > 0 && totalStock <= 0) {
      totalStock = sizeStrings.length; // default to number of sizes
    }

    // 4. Update product
    p.sizes = sizeStrings;
    p.stock = totalStock;
    p.isAvailable = totalStock > 0;

    // 5. Save
    await p.save();
    updated++;
    console.log(`✅ ${p._id}: sizes = [${sizeStrings.join(', ')}], stock = ${totalStock}`);
  }

  console.log(`🎉 Cleanup complete. Updated ${updated} products.`);
  process.exit(0);
}

finalCleanup().catch(console.error);