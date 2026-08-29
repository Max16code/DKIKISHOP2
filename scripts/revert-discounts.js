#!/usr/bin/env node

/**
 * Revert Discounts Script
 * Usage: 
 *   npm run revert-discounts:dry     - Preview what will be reverted
 *   npm run revert-discounts         - Revert all discounts
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

async function revertDiscounts() {
  let connection;
  
  try {
    console.log('\n🔄 Connecting to MongoDB...');
    connection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be saved');
      console.log('=' .repeat(60));
    }
    
    // Get products that were discounted
    const discountedProducts = await mongoose.connection.db.collection('products')
      .find({ discountApplied: true })
      .toArray();
    
    console.log(`📦 Found ${discountedProducts.length} products with discounts\n`);
    
    if (discountedProducts.length === 0) {
      console.log('✅ No discounts found to revert.');
      process.exit(0);
    }
    
    // Show preview
    console.log('🔍 Products that will be reverted:');
    console.log('=' .repeat(60));
    
    const preview = discountedProducts.slice(0, 10);
    preview.forEach(p => {
      console.log(`   ${p.title || 'Unnamed'}: ₦${p.price} → ₦${p.originalPrice} (revert ${p.discountPercent}% off)`);
    });
    
    if (discountedProducts.length > 10) {
      console.log(`   ... and ${discountedProducts.length - 10} more products`);
    }
    
    console.log('');
    
    if (dryRun) {
      console.log('✅ Dry run complete. Run without --dry-run to revert:');
      console.log('   npm run revert-discounts');
      process.exit(0);
    }
    
    console.log('⚠️  WARNING: This will revert all discounted prices!');
    console.log(`   - ${discountedProducts.length} products will be restored to original prices`);
    console.log('');
    
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n📝 Reverting discounts...');
    
    // Revert all discounted products
    const result = await mongoose.connection.db.collection('products').updateMany(
      { discountApplied: true },
      [
        { $set: { 
          price: "$originalPrice",
          discountApplied: false,
          discountPercent: 0
        } },
        { $unset: ["originalPrice", "discountDate"] }
      ]
    );
    
    console.log(`   ✅ ${result.modifiedCount} products reverted to original prices`);
    
    console.log('\n✅ Revert complete!');
    console.log('=' .repeat(60));
    
    // Show sample of reverted products
    const reverted = await mongoose.connection.db.collection('products')
      .find({ discountApplied: false })
      .limit(5)
      .toArray();
    
    if (reverted.length > 0) {
      console.log('\n📋 Sample of reverted products:');
      reverted.forEach(p => {
        console.log(`   ${p.title || 'Unnamed'}: ₦${p.price} (no discount)`);
      });
    }
    
    console.log('\n💡 All products restored to original prices');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Revert failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
    }
  }
}

revertDiscounts();