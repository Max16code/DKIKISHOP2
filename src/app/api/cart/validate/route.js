// /app/api/cart/validate/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/productModel';

export async function POST(request) {
  try {
    // 1️⃣ Connect to DB
    await dbConnect();

    // 2️⃣ Get cart items from request
    const { items } = await request.json();

    // 3️⃣ Basic validation
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, valid: false, message: 'Invalid cart data' },
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

    // 4️⃣ Check each product's stock
    const results = [];
    let allValid = true;
    let subtotal = 0;

    for (const item of items) {
      // Skip invalid items
      if (!item.productId || !item.quantity) {
        results.push({
          productId: item.productId || 'unknown',
          size: item.size || null,
          quantity: item.quantity || 0,
          valid: false,
          message: 'Missing product information',
        });
        allValid = false;
        continue;
      }

      try {
        // Find the product
        const product = await Product.findById(item.productId);

        if (!product) {
          results.push({
            productId: item.productId,
            size: item.size || null,
            quantity: item.quantity,
            valid: false,
            message: 'Product not found',
          });
          allValid = false;
          continue;
        }

        // Check availability
        if (!product.isAvailable || product.quantity < item.quantity) {
          results.push({
            productId: item.productId,
            productTitle: product.title,
            size: item.size || null,
            quantity: item.quantity,
            valid: false,
            message:
              product.quantity === 0
                ? 'Out of stock'
                : `Only ${product.quantity} available`,
            available: product.quantity,
          });
          allValid = false;
        } else {
          results.push({
            productId: item.productId,
            productTitle: product.title,
            size: item.size || null,
            quantity: item.quantity,
            valid: true,
            price: product.price,
            available: product.quantity,
          });

          // Add to subtotal
          subtotal += product.price * item.quantity;
        }
      } catch (error) {
        console.error(`Error checking product ${item.productId}:`, error);
        results.push({
          productId: item.productId,
          size: item.size || null,
          quantity: item.quantity,
          valid: false,
          message: 'Error checking availability',
        });
        allValid = false;
      }
    }

    // 5️⃣ Return validation results
    return NextResponse.json({
      success: true,
      valid: allValid,
      results,
      subtotal,
      total: subtotal, // frontend can add shipping/delivery
      message: allValid
        ? 'All items are available'
        : 'Some items need attention',
    });
  } catch (error) {
    console.error('Cart validation error:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: 'Server error during validation',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
