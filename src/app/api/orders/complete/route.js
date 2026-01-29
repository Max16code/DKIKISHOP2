// /src/app/api/orders/complete/route.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import Order from "@/models/orderModel";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  await dbConnect();

  try {
    const { reference } = await req.json();

    /* ============================
       1️⃣ VERIFY PAYSTACK PAYMENT
    ============================ */
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400 }
      );
    }

    const { metadata, customer, amount } = verifyData.data;
    const cartItems = metadata?.cartItems;
    const deliveryInfo = metadata?.buyer || {};

    if (!cartItems || cartItems.length === 0) {
      throw new Error("No cart items found in Paystack metadata");
    }

    /* ============================
       2️⃣ SAVE ORDER
    ============================ */
    const order = await Order.create({
      items: cartItems,
      email: customer.email,
      amount: amount / 100,
      paystackRef: reference,
      buyer: deliveryInfo,
      status: "paid",
      paidAt: new Date(),
    });

    /* ============================
       3️⃣ DECREMENT STOCK
    ============================ */
    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      if (!product) continue;

      product.quantity = Math.max(0, product.quantity - item.quantity);
      product.isAvailable = product.quantity > 0;
      await product.save();
    }

    /* ============================
       4️⃣ FORMAT ITEMS FOR EMAILS
    ============================ */
    const itemsTableHTML = cartItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border:1px solid #ddd;">
          <img src="${item.image}" width="80" style="display:block;" />
        </td>
        <td style="padding: 10px; border:1px solid #ddd;">
          ${item.title}<br/>
          <small>Size: ${item.size || 'N/A'}</small>
        </td>
        <td style="padding: 10px; border:1px solid #ddd; text-align:center;">
          ₦${item.price.toLocaleString()}
        </td>
        <td style="padding: 10px; border:1px solid #ddd; text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border:1px solid #ddd; text-align:right;">
          ₦${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>`
      )
      .join("");

    /* ============================
       5️⃣ SEND BUYER EMAIL
    ============================ */
    await resend.emails.send({
      from: `Dkikishop <${process.env.FROM_EMAIL}>`,
      to: customer.email,
      subject: "Your Dkikishop Order Receipt ✅",
      html: `
        <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto;">
          <h2 style="color:#1a73e8;">Payment Successful!</h2>
          <p>Hi ${deliveryInfo.name || customer.email},</p>
          <p>Thank you for shopping with Dkikishop. Here's your order summary:</p>

          <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color:#f2f2f2;">
                <th style="padding: 10px; border:1px solid #ddd;">Image</th>
                <th style="padding: 10px; border:1px solid #ddd;">Product</th>
                <th style="padding: 10px; border:1px solid #ddd;">Price</th>
                <th style="padding: 10px; border:1px solid #ddd;">Qty</th>
                <th style="padding: 10px; border:1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableHTML}
            </tbody>
          </table>

          <p style="text-align:right; margin-top:20px; font-size:16px;">
            <strong>Total Paid: ₦${(amount / 100).toLocaleString()}</strong>
          </p>

          <p><b>Delivery Address:</b> ${deliveryInfo.address || 'N/A'}, ${deliveryInfo.town || ''}</p>
          <p><b>Payment Reference:</b> ${reference}</p>

          <p style="margin-top:30px;">We appreciate your business! 💙<br/>- Dkikishop Team</p>
        </div>
      `,
    });

    /* ============================
       6️⃣ SEND ADMIN EMAIL
    ============================ */
    await resend.emails.send({
      from: `Dkikishop Orders <${process.env.FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🛒 New Dkikishop Order Received",
      html: `
        <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto;">
          <h2>New Order Alert</h2>
          <p><b>Buyer Name:</b> ${deliveryInfo.name || 'N/A'}</p>
          <p><b>Email:</b> ${customer.email}</p>
          <p><b>Phone:</b> ${deliveryInfo.phone || 'N/A'}</p>
          <p><b>Delivery Address:</b> ${deliveryInfo.address || 'N/A'}, ${deliveryInfo.town || ''}</p>
          <p><b>Total Amount:</b> ₦${(amount / 100).toLocaleString()}</p>
          <p><b>Payment Reference:</b> ${reference}</p>

          <h3>Items Purchased</h3>
          <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color:#f2f2f2;">
                <th style="padding:10px; border:1px solid #ddd;">Product</th>
                <th style="padding:10px; border:1px solid #ddd;">Size</th>
                <th style="padding:10px; border:1px solid #ddd;">Price</th>
                <th style="padding:10px; border:1px solid #ddd;">Qty</th>
                <th style="padding:10px; border:1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableHTML}
            </tbody>
          </table>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({
        message: "Order completed, stock updated & emails sent",
        orderId: order._id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Order completion error:", error);
    return new Response(
      JSON.stringify({ error: "Order processing failed" }),
      { status: 500 }
    );
  }
}
