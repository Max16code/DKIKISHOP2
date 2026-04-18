import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { getSession } from "@/lib/session";
import { sanitizeInput } from "@/lib/validate";

export async function PUT(request, { params }) {
  console.log("🔵 PUT REACHED");

  // Get ID from URL
  const { id } = await params;
  console.log("ID:", id);

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Product ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Auth
  const session = await getSession();
  if (!session?.isAdmin) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  await dbConnect();

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { title, description, price, category, sizes, quantity, images } = body;

  const updateData = {};
  if (title) updateData.title = sanitizeInput(title);
  if (description) updateData.description = sanitizeInput(description);
  if (price) updateData.price = Number(price);
  if (category) updateData.category = sanitizeInput(category).toLowerCase();
  if (Array.isArray(sizes)) updateData.sizes = sizes.map(s => sanitizeInput(s.trim()));
  if (Array.isArray(images)) updateData.images = images;
  if (quantity !== undefined) {
    const qty = Number(quantity);
    updateData.quantity = qty;
    updateData.stock = qty;
    updateData.isAvailable = qty > 0;
  }
  updateData.updatedAt = new Date();

  const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true });

  if (!updatedProduct) {
    return new Response(
      JSON.stringify({ error: "Product not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, product: updatedProduct }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}