// src/app/api/deleteproduct/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/productModel';
import { getSession } from '@/lib/session'; // adjust path if needed

export async function DELETE(request, context) {
  try {
    // 1. Check admin session
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // 2. Get id from params (no await / Promise needed in plain JS)
    const id = context.params?.id;

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    console.log(`Admin deleted product: ${id} (${deletedProduct.title || 'Unnamed'})`);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during deletion' },
      { status: 500 }
    );
  }
}