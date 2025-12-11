import dbConnect from "@/lib/dbconnect";
import Product from "@/models/productModel";
import Order from "@/models/orderModel";


export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { items, paystackRef } = body;

    // Validate request
    if (!items?.length || !paystackRef) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Save the order and return it to frontend
    const savedOrder = await Order.create({
      items,
      paystackRef,
      createdAt: new Date(),
    });

    // Reduce inventory for each item purchased
    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) continue;

      const newQty = product.quantity - item.quantity;

      product.quantity = Math.max(newQty, 0);

      // Mark out of stock if quantity hits 0
      if (product.quantity === 0) {
        product.isAvailable = false; // Make sure this field exists in product model
      }

      await product.save();
    }

    return new Response(
      JSON.stringify({ success: true, order: savedOrder, message: "Order completed and inventory updated." }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Order completion error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
