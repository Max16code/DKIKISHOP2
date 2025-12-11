// /src/app/api/orders/complete/route.js
import dbConnect from "@/lib/mongodb";     // must match exactly
import Product from "@/models/productModel";   // lowercase 'p' for productModel.js
import Order from "@/models/orderModel";       // lowercase 'o' for orderModel.js


export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();  
    const { items, paystackRef } = body;

    // Save order
    const newOrder = await Order.create({
      items,
      paystackRef,
      createdAt: new Date(),
    });

    // Reduce inventory for each item purchased
    for (const item of items) {
      const product = await Product.findById(item._id);

      if (!product) continue;

      const newQty = product.quantity - item.quantity;

      product.quantity = newQty < 0 ? 0 : newQty;
      await product.save();
    }

    return new Response(
      JSON.stringify({ message: "Order completed and inventory updated." }),
      { status: 200 }
    );
  } catch (error) {
    console.log("Order completion error:", error);
    return new Response(JSON.stringify({ error: "Error completing order" }), {
      status: 500,
    });
  }
}
