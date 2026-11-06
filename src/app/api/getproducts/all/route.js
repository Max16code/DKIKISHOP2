import dbConnect from '@/utils/db';
import Product from '@/models/productModel';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const available = searchParams.get('available');
    const section = searchParams.get('section');
    const limit = parseInt(searchParams.get('limit')) || 0;

    let query = {};
    
    if (available === 'true') {
      query.isAvailable = true;
      query.$or = [{ stock: { $gt: 0 } }, { quantity: { $gt: 0 } }];
    }

    // Filter by section if provided
    if (section) {
      query.section = section;
    }

    let productsQuery = Product.find(query).sort({ createdAt: -1 });
    
    if (limit > 0) {
      productsQuery = productsQuery.limit(limit);
    }

    const products = await productsQuery.lean();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
