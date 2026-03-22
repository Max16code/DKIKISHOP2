// app/api/cart/validate/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/productModel';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log('VALIDATION BODY RECEIVED:', JSON.stringify(body, null, 2));

    const { items } = body;

    if (!items || !Array.isArray(items)) {
      console.warn('Items not array or missing');
      return NextResponse.json(
        { success: false, valid: false, message: 'Invalid cart data - items must be an array' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        valid: true,
        message: 'Cart is empty',
        subtotal: 0,
        total: 0,
      });
    }

    // ---- Step 1: Prepare data and collect valid product IDs ----
    const itemsWithInfo = [];
    const productIds = [];
    const invalidItems = [];

    for (const item of items) {
      const productId = item.productId || item._id;
      const quantity = Number(item.quantity);

      // Validate ID format early
      if (!productId || !mongoose.isValidObjectId(productId)) {
        console.warn('Invalid product ID format:', productId);
        invalidItems.push({
          productId: productId || 'unknown',
          size: item.size || null,
          quantity,
          valid: false,
          message: 'Invalid product ID (must be valid MongoDB ID)',
        });
        continue;
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        invalidItems.push({
          productId,
          size: item.size || null,
          quantity,
          valid: false,
          message: 'Quantity must be a positive integer',
        });
        continue;
      }

      itemsWithInfo.push({ productId, quantity, size: item.size || null });
      productIds.push(productId);
    }

    // If all items were invalid, return early
    if (itemsWithInfo.length === 0) {
      return NextResponse.json({
        success: true,
        valid: false,
        results: invalidItems,
        message: 'No valid items in cart',
      });
    }

    // ---- Step 2: Fetch ALL products in ONE query ----
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // ---- Step 3: Build a Map for O(1) lookups ----
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // ---- Step 4: Process items using the map ----
    const results = [];
    let allValid = true;
    let subtotal = 0;
    const shopIds = new Set();

    for (const { productId, quantity, size } of itemsWithInfo) {
      const product = productMap.get(productId);

      if (!product) {
        results.push({
          productId,
          size,
          quantity,
          valid: false,
          message: 'Product not found',
        });
        allValid = false;
        continue;
      }

      // Single-shop enforcement
      if (product.shopId) {
        shopIds.add(product.shopId.toString());
        if (shopIds.size > 1) {
          results.push({
            productId,
            size,
            quantity,
            valid: false,
            message: 'Items from multiple shops not allowed in one order',
          });
          allValid = false;
          continue;
        }
      }

      // Size check
      if (size && !product.sizes?.includes(size)) {
        results.push({
          productId,
          productTitle: product.title,
          size,
          quantity,
          valid: false,
          message: `Size ${size} no longer available`,
        });
        allValid = false;
        continue;
      }

      // Stock check
      if (!product.isAvailable || product.stock < quantity) {
        results.push({
          productId,
          productTitle: product.title,
          size,
          quantity,
          valid: false,
          message: product.stock === 0 ? 'Out of stock' : `Only ${product.stock} available`,
          available: product.stock,
        });
        allValid = false;
      } else {
        results.push({
          productId,
          productTitle: product.title,
          size,
          quantity,
          valid: true,
          price: product.price,
          available: product.stock,
          shopId: product.shopId?.toString(),
        });
        subtotal += product.price * quantity;
      }
    }

    // Append previously invalid items (those that failed ID/quantity checks)
    results.push(...invalidItems);
    if (invalidItems.length > 0) allValid = false;

    return NextResponse.json({
      success: true,
      valid: allValid,
      results,
      subtotal,
      total: subtotal,
      message: allValid ? 'All items available' : 'Some items unavailable or out of stock',
      shopId: shopIds.size === 1 ? [...shopIds][0] : null,
    });
  } catch (error) {
    console.error('Cart validation error:', {
      message: error.message,
      stack: error.stack?.substring(0, 800) || 'No stack',
    });

    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: 'Server error during cart validation',
        errorDetail: error.message,
      },
      { status: 500 }
    );
  }
}