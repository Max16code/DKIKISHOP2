import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";

export async function GET(request, context) {
  await dbConnect();

  const { id } = await context.params;


  try {
    const product = await Product.findById(id);

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid product ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
