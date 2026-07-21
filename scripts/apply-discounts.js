#!/usr/bin/env node

/**
 * Apply Discounts Script - PRODUCTION READY (NO GAPS)
 * Rules:
 *   - ≤ ₦5,999: 20% off
 *   - ₦6,000 - ₦10,999: 25% off
 *   - ≥ ₦11,000: 30% off
 * 
 * Usage: 
 *   npm run apply-discounts:dry     - Preview changes without saving (SAFE)
 *   npm run apply-discounts         - Apply discounts (with confirmation)
 *   npm run apply-discounts:force   - Apply discounts without confirmation
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

if (!MONGODB_URI) {
  console.error('❌ No MongoDB URI found in .env file');
  console.error('Please set MONGODB_URI or MONGO_URI in your .env.local');
  process.exit(1);
}

// Create backup directory if it doesn't exist
const BACKUP_DIR = path.join(process.cwd(), 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function applyDiscounts() {
  let connection;
  const startTime = Date.now();
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🛍️  DKIKISHOP DISCOUNT ENGINE - PRODUCTION MODE');
    console.log('='.repeat(60));
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    console.log(`🔧 Mode: ${dryRun ? '🔍 DRY RUN (Preview Only - NO CHANGES)' : '⚡ LIVE (Applying Changes)'}`);
    console.log('📋 Rules: ≤₦5,999 (20%) | ₦6,000-₦10,999 (25%) | ≥₦11,000 (30%)');
    console.log('='.repeat(60) + '\n');
    
    console.log('🔄 Connecting to MongoDB...');
    connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Get ALL products
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log(`📦 Found ${products.length} products in database\n`);
    
    // Categorize ALL products - NO GAPS!
    const under5999 = products.filter(p => p.price <= 5999);
    const between6000And10999 = products.filter(p => p.price >= 6000 && p.price <= 10999);
    const over11000 = products.filter(p => p.price >= 11000);
    
    console.log('📊 Price Categories (NO GAPS - ALL PRODUCTS COVERED):');
    console.log(`   ✅ ≤ ₦5,999: ${under5999.length} products (20% off)`);
    console.log(`   ✅ ₦6,000 - ₦10,999: ${between6000And10999.length} products (25% off)`);
    console.log(`   ✅ ≥ ₦11,000: ${over11000.length} products (30% off)`);
    console.log('');
    
    const totalToDiscount = under5999.length + between6000And10999.length + over11000.length;
    console.log(`📊 Total products to discount: ${totalToDiscount} out of ${products.length}`);
    console.log(`   ✅ ${((totalToDiscount / products.length) * 100).toFixed(1)}% of ALL products will be discounted\n`);
    
    // ---- DRY RUN: PREVIEW ONLY - NO CHANGES ----
    if (dryRun) {
      console.log('🔍 PREVIEW OF CHANGES (First 20 products):');
      console.log('-'.repeat(60));
      
      // Show products from each category
      const preview = [...under5999, ...between6000And10999, ...over11000].slice(0, 20);
      
      if (preview.length === 0) {
        console.log('   No products found to discount!');
      } else {
        preview.forEach((p, i) => {
          let percent;
          let newPrice;
          let category;
          if (p.price <= 5999) {
            percent = 20;
            newPrice = Math.floor(p.price * 0.8);
            category = '20%';
          } else if (p.price >= 6000 && p.price <= 10999) {
            percent = 25;
            newPrice = Math.floor(p.price * 0.75);
            category = '25%';
          } else if (p.price >= 11000) {
            percent = 30;
            newPrice = Math.floor(p.price * 0.7);
            category = '30%';
          }
          console.log(`   ${(i + 1).toString().padStart(2)}. ${(p.title || 'Unnamed').slice(0, 35).padEnd(35)} ₦${p.price} → ₦${newPrice} (${category} off)`);
        });
      }
      
      if (totalToDiscount > 20) {
        console.log(`   ... and ${totalToDiscount - 20} more products`);
      }
      
      // Show category breakdown
      console.log('\n📊 Category Breakdown:');
      console.log(`   - ≤ ₦5,999: ${under5999.length} products (20% off)`);
      console.log(`   - ₦6,000 - ₦10,999: ${between6000And10999.length} products (25% off)`);
      console.log(`   - ≥ ₦11,000: ${over11000.length} products (30% off)`);
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ DRY RUN COMPLETE - NO CHANGES WERE MADE');
      console.log('   This was a preview only. Your database is UNCHANGED.');
      console.log('   To apply discounts, run: npm run apply-discounts');
      console.log('='.repeat(60));
      
      // Show sample of what will change
      if (preview.length > 0) {
        console.log('\n📋 SUMMARY OF CHANGES:');
        console.log(`   - ${under5999.length} products will get 20% off`);
        console.log(`   - ${between6000And10999.length} products will get 25% off`);
        console.log(`   - ${over11000.length} products will get 30% off`);
        console.log(`   - TOTAL: ${totalToDiscount} products will change`);
        console.log(`   - ${products.length - totalToDiscount} products will remain unchanged (if any)`);
      }
      console.log('');
      
      process.exit(0);
    }
    
    // ---- PRODUCTION MODE: APPLY CHANGES ----
    
    // Check if discounts were already applied
    const alreadyDiscounted = await mongoose.connection.db.collection('products')
      .find({ discountApplied: true })
      .limit(1)
      .toArray();
    
    if (alreadyDiscounted.length > 0) {
      console.log('⚠️  WARNING: Some products already have discounts applied!');
      console.log('   Running again will overwrite existing discounts.');
      console.log('   To revert, use: npm run revert-discounts\n');
    }
    
    // Create backup of current state
    console.log('📦 Creating pre-discount backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `pre-discount-backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
    console.log(`   ✅ Backup saved: ${backupFile}\n`);
    
    // Show summary before applying
    console.log('⚠️  WARNING: This will permanently change ALL prices in PRODUCTION!');
    console.log(`   - ${under5999.length} products will get 20% off`);
    console.log(`   - ${between6000And10999.length} products will get 25% off`);
    console.log(`   - ${over11000.length} products will get 30% off`);
    console.log(`   - ${((totalToDiscount / products.length) * 100).toFixed(1)}% of ALL products will be discounted`);
    console.log('');
    
    if (!force) {
      console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue...');
      let countdown = 10;
      while (countdown > 0) {
        process.stdout.write(`\r⏳ ${countdown} seconds remaining...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        countdown--;
      }
      console.log('\n');
    } else {
      console.log('⚡ Force mode enabled - applying immediately...\n');
    }
    
    console.log('📝 Applying discounts...');
    
    // 20% off for ALL products ≤ 5,999
    const result1 = await mongoose.connection.db.collection('products').updateMany(
      { price: { $lte: 5999 } },
      [
        { $set: { 
          price: { $floor: { $multiply: ["$price", 0.8] } },
          originalPrice: "$price",
          discountApplied: true,
          discountPercent: 20,
          discountDate: new Date(),
          discountType: "sale"
        } }
      ]
    );
    console.log(`   ✅ ${result1.modifiedCount} products updated (20% off)`);
    
    // 25% off for ALL products between 6,000 and 10,999
    const result2 = await mongoose.connection.db.collection('products').updateMany(
      { price: { $gte: 6000, $lte: 10999 } },
      [
        { $set: { 
          price: { $floor: { $multiply: ["$price", 0.75] } },
          originalPrice: "$price",
          discountApplied: true,
          discountPercent: 25,
          discountDate: new Date(),
          discountType: "sale"
        } }
      ]
    );
    console.log(`   ✅ ${result2.modifiedCount} products updated (25% off)`);
    
    // 30% off for ALL products ≥ 11,000
    const result3 = await mongoose.connection.db.collection('products').updateMany(
      { price: { $gte: 11000 } },
      [
        { $set: { 
          price: { $floor: { $multiply: ["$price", 0.7] } },
          originalPrice: "$price",
          discountApplied: true,
          discountPercent: 30,
          discountDate: new Date(),
          discountType: "sale"
        } }
      ]
    );
    console.log(`   ✅ ${result3.modifiedCount} products updated (30% off)`);
    
    const totalModified = result1.modifiedCount + result2.modifiedCount + result3.modifiedCount;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ DISCOUNTS APPLIED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Total products updated: ${totalModified} out of ${products.length}`);
    console.log(`📊 Coverage: ${((totalModified / products.length) * 100).toFixed(1)}% of ALL products`);
    console.log(`⏱️  Time taken: ${elapsed} seconds`);
    console.log(`📁 Backup saved: ${backupFile}`);
    console.log('='.repeat(60));
    
    // Show sample of updated products
    const updated = await mongoose.connection.db.collection('products')
      .find({ discountApplied: true })
      .limit(10)
      .toArray();
    
    if (updated.length > 0) {
      console.log('\n📋 Sample of updated products:');
      console.log('-'.repeat(60));
      updated.forEach((p, i) => {
        console.log(`   ${(i + 1).toString().padStart(2)}. ${(p.title || 'Unnamed').slice(0, 35).padEnd(35)} ₦${p.originalPrice} → ₦${p.price} (${p.discountPercent}% off)`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 NEXT STEPS:');
    console.log('   1. Check admin dashboard to verify prices');
    console.log('   2. Visit the website to see new prices');
    console.log('   3. To revert: npm run revert-discounts');
    console.log('   4. To restore from backup: Use MongoDB Atlas backup');
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ DISCOUNT APPLICATION FAILED:');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(60));
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   1. Check your MongoDB connection');
    console.log('   2. Verify your .env.local has MONGODB_URI');
    console.log('   3. Check MongoDB Atlas is accessible');
    console.log('   4. Try running npm run apply-discounts:dry first');
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
    }
  }
}

applyDiscounts();