// scripts/rollbackSizes.js
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env.local');

// Load environment variables (fallback)
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
  console.log('⚠️ No .env.local found, relying on --env-file');
}

import connectDB from '../src/lib/mongodb.js';
import Product from '../src/models/productModel.js';

async function rollback() {
  await connectDB();
  console.log('📦 Connected to MongoDB');

  // Find all products (including those that were never migrated)
  const products = await Product.find({});
  console.log(`🔍 Found ${products.length} products.`);

  let updated = 0;
  for (const p of products) {
    let newSizes = [];
    let totalStock = p.stock ?? p.quantity ?? 0;

    // If sizes is an array of objects, convert to string array
    if (Array.isArray(p.sizes) && p.sizes.length > 0) {
      // Check first element type
      const first = p.sizes[0];
      if (typeof first === 'object') {
        // New format: each element is { size, stock }
        newSizes = p.sizes.map(s => s.size).filter(Boolean);
        // Recalculate total stock as sum of all size stocks
        totalStock = p.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
      } else if (typeof first === 'string') {
        // Already old format, nothing to change
        continue;
      }
    } else if (!Array.isArray(p.sizes)) {
      // sizes field might be missing or invalid; we'll set it to empty array
      newSizes = [];
    }

    // If we have newSizes (meaning we converted), update product
    if (newSizes.length > 0) {
      p.sizes = newSizes;
      p.stock = totalStock;
      p.isAvailable = totalStock > 0;
      await p.save();
      updated++;
      console.log(`✅ Updated product ${p._id}: sizes = [${newSizes.join(', ')}], stock = ${totalStock}`);
    }
  }

  console.log(`🎉 Rollback complete. Updated ${updated} products.`);
  process.exit(0);
}

rollback().catch(console.error);
