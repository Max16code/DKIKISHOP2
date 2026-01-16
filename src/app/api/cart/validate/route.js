// /app/api/cart/validate/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // Use your existing DB connection
import Product from '@/models/productModel'; // Use your actual Product model path

export async function POST(request) {
  try {
    // 1. Connect to DB (use YOUR existing connection method)
    await dbConnect();
    
    // 2. Get cart items from request
    const { items } = await request.json();
    
    // 3. Basic validation
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: 'Invalid cart data'
      }, { status: 400 });
    }
    
    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        valid: true,
        message: 'Cart is empty',
        subtotal: 0,
        total: 0
      });
    }
    
    // 4. Check each product's stock
    const results = [];
    let allValid = true;
    let subtotal = 0;
    
    for (const item of items) {
      // Skip invalid items
      if (!item.productId || !item.quantity) {
        results.push({
          productId: item.productId || 'unknown',
          valid: false,
          message: 'Missing product information'
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
            valid: false,
            message: 'Product not found'
          });
          allValid = false;
          continue;
        }
        
        // Check if available and in stock
        if (!product.isAvailable || product.stock < item.quantity) {
          results.push({
            productId: item.productId,
            productTitle: product.title,
            valid: false,
            message: product.stock === 0 
              ? 'Out of stock' 
              : `Only ${product.stock} available`,
            available: product.stock
          });
          allValid = false;
        } else {
          results.push({
            productId: item.productId,
            productTitle: product.title,
            valid: true,
            price: product.price,
            available: product.stock
          });
          
          // Add to subtotal
          subtotal += product.price * item.quantity;
        }
      } catch (error) {
        console.error(`Error checking product ${item.productId}:`, error);
        results.push({
          productId: item.productId,
          valid: false,
          message: 'Error checking availability'
        });
        allValid = false;
      }
    }
    
    // 5. Return the validation results
    return NextResponse.json({
      success: true,
      valid: allValid,
      results,
      subtotal,
      total: subtotal, // Add shipping if needed
      message: allValid 
        ? 'All items are available' 
        : 'Some items need attention'
    });
    
  } catch (error) {
    console.error('Cart validation error:', error);
    return NextResponse.json({
      success: false,
      valid: false,
      message: 'Server error during validation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}