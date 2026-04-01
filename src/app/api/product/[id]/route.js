import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";

// CORS headers to include in all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Replace with your domain in production
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request, context) {
  await dbConnect();

  const { id } = await context.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Normalize image fields for backward compatibility
    const normalizedProduct = {
      ...product._doc,
      images: Array.isArray(product.images)
        ? product.images
        : product.image
        ? [product.image]
        : [],
    };

    return new Response(JSON.stringify(normalizedProduct), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Product fetch error:", err);
    return new Response(
      JSON.stringify({ error: "Invalid product ID or DB error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}