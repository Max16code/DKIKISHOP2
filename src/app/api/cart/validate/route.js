// app/api/cart/validate/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/productModel';

export async function POST(request) {
  try {
    await dbConnect();

    const { items } = await request.json();

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

    const results = [];
    let allValid = true;
    let subtotal = 0;

    // Collect all shopIds to enforce single-shop cart
    const shopIds = new Set();

    for (const item of items) {
      // Skip obviously invalid items
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
        results.push({
          productId: item.productId || 'unknown',
          size: item.size || null,
          quantity: item.quantity || 0,
          valid: false,
          message: 'Invalid product ID or quantity',
        });
        allValid = false;
        continue;
      }

      try {
        const product = await Product.findById(item.productId).lean();

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

        // Enforce single-shop cart
        if (product.shopId) {
          shopIds.add(product.shopId.toString());
          if (shopIds.size > 1) {
            results.push({
              productId: item.productId,
              size: item.size || null,
              quantity: item.quantity,
              valid: false,
              message: 'Items from multiple shops are not allowed in one order',
            });
            allValid = false;
            continue;
          }
        }

        // Size validation (if selected)
        if (item.size && !product.sizes?.includes(item.size)) {
          results.push({
            productId: item.productId,
            productTitle: product.title,
            size: item.size,
            quantity: item.quantity,
            valid: false,
            message: `Size ${item.size} no longer available`,
          });
          allValid = false;
          continue;
        }

        // Stock check (use stock field as source of truth)
        if (!product.isAvailable || product.stock < item.quantity) {
          results.push({
            productId: item.productId,
            productTitle: product.title,
            size: item.size || null,
            quantity: item.quantity,
            valid: false,
            message:
              product.stock === 0
                ? 'Out of stock'
                : `Only ${product.stock} available`,
            available: product.stock,
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
            available: product.stock,
            shopId: product.shopId?.toString(), // optional: return for frontend
          });

          subtotal += product.price * item.quantity;
        }
      } catch (error) {
        console.error(`Error validating product ${item.productId}:`, error);
        results.push({
          productId: item.productId,
          size: item.size || null,
          quantity: item.quantity,
          valid: false,
          message: 'Server error checking availability',
        });
        allValid = false;
      }
    }

    return NextResponse.json({
      success: true,
      valid: allValid,
      results,
      subtotal,
      total: subtotal, // frontend adds delivery fee if needed
      message: allValid
        ? 'All items are available'
        : 'Some items are unavailable or out of stock',
      shopId: shopIds.size === 1 ? [...shopIds][0] : null, // return the single shopId if consistent
    });
  } catch (error) {
    console.error('Cart validation server error:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: 'Server error during cart validation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}