// app/api/updateproduct/[id]/route.js
import dbConnect from '@/lib/mongodb';
import product from "@/models/productModel";

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = await context.params; // ✅ await this
  const updates = await req.json();

  try {
    const updatedProduct = await product.findByIdAndUpdate(id, updates, { new: true });
    return Response.json(updatedProduct);
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Failed to update product' }), { status: 500 });
  }
}
