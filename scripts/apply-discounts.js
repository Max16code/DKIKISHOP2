#!/usr/bin/env node

/**
 * Apply Discounts Script - Limited to first 3 items per category
 * Usage: 
 *   npm run apply-discounts:dry     - Preview changes without saving
 *   npm run apply-discounts         - Apply discounts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const dryRun = process.argv.includes('--dry-run');

if (!MONGODB_URI) {
  console.error('❌ No MongoDB URI found in .env file');
  process.exit(1);
}

async function applyDiscounts() {
  let connection;
  
  try {
    console.log('\n🔄 Connecting to MongoDB...');
    connection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be saved');
      console.log('=' .repeat(60));
    }
    
    // Get all products grouped by category
    const allProducts = await mongoose.connection.db.collection('products').find({}).toArray();
    
    // Group products by category
    const categories = {};
    allProducts.forEach(p => {
      const cat = p.category || 'uncategorized';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(p);
    });
    
    console.log(`📦 Found ${allProducts.length} products in ${Object.keys(categories).length} categories\n`);
    
    // Select first 3 products from each category
    let productsToDiscount = [];
    Object.keys(categories).forEach(cat => {
      const catProducts = categories[cat];
      // Sort by createdAt to get oldest first (or just take first 3)
      const selected = catProducts.slice(0, 3);
      productsToDiscount = [...productsToDiscount, ...selected];
      console.log(`   ${cat}: ${catProducts.length} products → selecting first 3`);
    });
    
    console.log(`\n📊 Total products selected for discount: ${productsToDiscount.length}\n`);
    
    // Filter selected products by price
    const under10000 = productsToDiscount.filter(p => p.price <= 10000);
    const over11000 = productsToDiscount.filter(p => p.price >= 11000);
    const unaffected = productsToDiscount.filter(p => p.price > 10000 && p.price < 11000);
    
    console.log('📊 Price Categories (selected products):');
    console.log(`   - ≤ ₦10,000: ${under10000.length} products (20% off)`);
    console.log(`   - ≥ ₦11,000: ${over11000.length} products (30% off)`);
    console.log(`   - Unaffected: ${unaffected.length} products (₦10,001 - ₦10,999)`);
    console.log('');
    
    // Get IDs of products to discount
    const productIdsToDiscount = productsToDiscount.map(p => p._id);
    
    if (dryRun) {
      // Show preview of changes
      console.log('🔍 Preview of selected products:');
      console.log('=' .repeat(60));
      
      productsToDiscount.forEach(p => {
        const percent = p.price <= 10000 ? 20 : 30;
        const newPrice = Math.floor(p.price * (1 - percent / 100));
        const status = p.price > 10000 && p.price < 11000 ? 'UNCHANGED' : `${percent}% off`;
        console.log(`   ${p.title || 'Unnamed'} (${p.category || 'uncategorized'}): ₦${p.price} → ${p.price > 10000 && p.price < 11000 ? '₦' + p.price : '₦' + newPrice} (${status})`);
      });
      
      console.log('\n✅ Dry run complete. Run without --dry-run to apply:');
      console.log('   npm run apply-discounts');
      process.exit(0);
    }
    
    // Show summary before applying
    console.log('⚠️  WARNING: This will permanently change prices for selected products!');
    console.log(`   - ${under10000.length} products will get 20% off`);
    console.log(`   - ${over11000.length} products will get 30% off`);
    console.log(`   - ${unaffected.length} products will remain unchanged`);
    console.log('');
    
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n📝 Applying discounts...');
    
    // 20% off for products ≤ 10,000 (only selected products)
    const result1 = await mongoose.connection.db.collection('products').updateMany(
      { 
        _id: { $in: productIdsToDiscount },
        price: { $lte: 10000 }
      },
      [
        { $set: { 
          price: { $floor: { $multiply: ["$price", 0.8] } },
          originalPrice: "$price",
          discountApplied: true,
          discountPercent: 20,
          discountDate: new Date()
        } }
      ]
    );
    console.log(`   ✅ ${result1.modifiedCount} products updated (20% off)`);
    
    // 30% off for products ≥ 11,000 (only selected products)
    const result2 = await mongoose.connection.db.collection('products').updateMany(
      { 
        _id: { $in: productIdsToDiscount },
        price: { $gte: 11000 }
      },
      [
        { $set: { 
          price: { $floor: { $multiply: ["$price", 0.7] } },
          originalPrice: "$price",
          discountApplied: true,
          discountPercent: 30,
          discountDate: new Date()
        } }
      ]
    );
    console.log(`   ✅ ${result2.modifiedCount} products updated (30% off)`);
    
    console.log('\n✅ Discounts applied successfully!');
    console.log('=' .repeat(60));
    
    // Show sample of updated products
    const updated = await mongoose.connection.db.collection('products')
      .find({ 
        _id: { $in: productIdsToDiscount },
        discountApplied: true 
      })
      .limit(10)
      .toArray();
    
    if (updated.length > 0) {
      console.log('\n📋 Sample of updated products:');
      updated.forEach(p => {
        console.log(`   ${p.title || 'Unnamed'} (${p.category || 'uncategorized'}): ₦${p.originalPrice} → ₦${p.price} (${p.discountPercent}% off)`);
      });
    }
    
    console.log('\n💡 To verify: Check your products in the admin dashboard');
    console.log('💡 To restore: Use your MongoDB Atlas backup snapshot');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Discount application failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
    }
  }
}

applyDiscounts();