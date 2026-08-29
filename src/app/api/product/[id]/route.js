import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { getSession } from "@/lib/session";
import { sanitizeInput } from "@/lib/validate";

// CORS headers to include in all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Replace with your domain in production
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET handler
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

    // Normalize image fields for backward compatibility
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

// ✅ PUT handler – fixed (no duplicate extraction)
export async function PUT(request, context) {
  // 🔍 Debug logs
  console.log("🔍 PUT handler called");
  console.log("context.params:", context.params);

  // Extract ID once from URL parameters
  const { id } = await context.params;
  console.log("Extracted id:", id);

  if (!id) {
    console.log("❌ No ID found – returning 400");
    return new Response(
      JSON.stringify({ success: false, error: "Product ID is required." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 1. Admin authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized access." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Connect to database
    await dbConnect();

    // 3. Parse request body
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, description, price, category, sizes, quantity, images } = body;

    // 4. Build update object (sanitize inputs)
    const updateData = {};

    if (title) updateData.title = sanitizeInput(title);
    if (description) updateData.description = sanitizeInput(description);
    if (price) updateData.price = Number(price);
    if (category) updateData.category = sanitizeInput(category).toLowerCase();
    if (Array.isArray(sizes)) {
      updateData.sizes = sizes.map(s => sanitizeInput(s.trim()));
    }
    if (Array.isArray(images)) updateData.images = images;
    if (quantity !== undefined) {
      const qty = Number(quantity);
      updateData.quantity = qty;
      updateData.stock = qty;
      updateData.isAvailable = qty > 0;
    }

    updateData.updatedAt = new Date();

    // 5. Update product in database
    const updatedProduct = await Product.findByIdAndUpdate(
      id,   // using the ID from URL
      { $set: updateData },
      { new: true }
    );

    if (!updatedProduct) {
      return new Response(
        JSON.stringify({ success: false, error: "Product not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Return success response
    return new Response(
      JSON.stringify({ success: true, product: updatedProduct }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("🔴 Update Product Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}