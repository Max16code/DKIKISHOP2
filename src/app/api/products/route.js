import dbConnect from "@/lib/mongodb";
import product from "@/models/productModel";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let query = {};
    if (category) {
      query.category = category.toLowerCase();
    }

    const products = await product.find(query).sort({ createdAt: -1 });

    return new Response(JSON.stringify({ success: true, products }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
