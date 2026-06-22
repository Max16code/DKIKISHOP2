// app/api/search/route.js
import dbConnect from '@/utils/db';
import Product from '@/models/productModel';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();   // 👈 get category param

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, products: [] });
    }

    await dbConnect();

    // Build search filter
    const searchFilter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ],
      isAvailable: true,
      $expr: { $gt: [{ $add: ['$stock', '$quantity'] }, 0] }
    };

    // If category is provided, add it to filter
    if (category) {
      searchFilter.category = category;
    }

    const products = await Product.find(searchFilter)
      .select('_id title price images category')
      .limit(8);

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}