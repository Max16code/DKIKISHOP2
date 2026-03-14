// src/app/api/updateproduct/[id]/route.js
import dbConnect from '@/lib/mongodb';
import Product from '@/models/productModel'; // ← capital P (Mongoose model convention)
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sanitizeInput } from '@/lib/validate'; // if you have this from upload

const allowedCategories = [
  "jeans", "blazers", "tops", "shorts", "activewears", "accessories", "skirts", "dresses"
];

export async function PUT(req, { params }) {
  const { id } = params; // ← no await needed

  try {
    // 1. Auth check
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();

    // 2. Parse body
    const updates = await req.json();

    // 3. Sanitize & validate (same as upload)
    const title = sanitizeInput(updates.title);
    const description = sanitizeInput(updates.description);
    const price = Number(updates.price);
    const category = sanitizeInput(updates.category)?.trim().toLowerCase();
    const sizes = Array.isArray(updates.sizes) ? updates.sizes.map(s => sanitizeInput(s.trim())).filter(Boolean) : [];
    const quantity = Number(updates.quantity || 1);
    const images = Array.isArray(updates.images) ? updates.images : [];
    const shopId = updates.shopId || '697780d848d182949a9fc132';

    if (!title || !description || isNaN(price) || price <= 0 || !category || sizes.length === 0 || images.length === 0 || !shopId) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Allowed: ${allowedCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // 4. Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        category,
        sizes,
        quantity,
        stock: quantity,
        isAvailable: quantity > 0,
        images,
        shopId,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    console.log('Product updated:', updatedProduct._id);

    return NextResponse.json({ success: true, product: updatedProduct });

  } catch (err) {
    console.error('Update error:', err.message, err.stack?.substring(0, 500));
    return NextResponse.json(
      { success: false, error: err.message || 'Server error during update' },
      { status: 500 }
    );
  }
}