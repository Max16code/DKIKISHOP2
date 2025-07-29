// app/api/deleteproduct/[id]/route.js
import dbConnect from '@/lib/mongodb'
import Product from '@/models/productModel'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
  try {
    await dbConnect()
    const { id } = params

    const deletedProduct = await Product.findByIdAndDelete(id)

   if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting product' },
      { status: 500 }
    );
  }
}