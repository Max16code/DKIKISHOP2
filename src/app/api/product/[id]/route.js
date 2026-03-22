import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";

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
          headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Product fetch error:", err);
    return new Response(
      JSON.stringify({ error: "Invalid product ID or DB error" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
