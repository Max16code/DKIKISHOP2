// /src/app/api/paystack/webhook/route.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import Order from "@/models/orderModel";
import nodemailer from "nodemailer";

export async function POST(req) {
  await dbConnect();

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

  try {
    const body = await req.json();
    const signature = req.headers.get("x-paystack-signature");

    // ---------------- Verify webhook signature ----------------
    const crypto = await import("crypto");
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400 }
      );
    }

    // Only process successful payments
    if (body.event !== "charge.success") {
      return new Response(
        JSON.stringify({ message: "Event ignored" }),
        { status: 200 }
      );
    }

    const { metadata, customer, reference, amount } = body.data;
    const items = metadata?.cartItems;

    if (!items || items.length === 0)
      throw new Error("No cart items in metadata");

    // ---------------- Save order ----------------
    const order = await Order.create({
      items,
      customerName: metadata.buyer.name,
      email: customer.email,
      phone: metadata.buyer.phone,
      shippingAddress: {
        street: metadata.buyer.address,
        city: metadata.buyer.town,
      },
      service: metadata.buyer.service,
      portDeliveryOption: metadata.buyer.portDeliveryOption || null,
      totalAmount: metadata.totalAmount,
      paystackRef: reference,
      status: "paid",
      createdAt: new Date(),
    });

    // ---------------- Decrement stock ----------------
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      product.quantity = Math.max(0, product.quantity - item.quantity);
      await product.save();
    }

    // ---------------- Nodemailer Setup ----------------
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ---------------- Email to customer ----------------
    const customerHtml = `
      <h2>Thank you for your purchase, ${metadata.buyer.name}!</h2>
      <p>Order Reference: <strong>${reference}</strong></p>
      <p>Delivery Service: <strong>${metadata.buyer.service}</strong></p>
      ${
        metadata.buyer.service === "Portharcourt"
          ? `<p>PortHarcourt Option: <strong>${metadata.buyer.portDeliveryOption}</strong></p>`
          : ""
      }
      <p>Shipping Address: ${metadata.buyer.address}, ${metadata.buyer.town}</p>
      <ul>
        ${items
          .map(
            (i) =>
              `<li>${i.quantity} × ${i.title} (₦${i.price.toLocaleString()})</li>`
          )
          .join("")}
      </ul>
      <p><strong>Total Paid: ₦${metadata.totalAmount.toLocaleString()}</strong></p>
      <p>Estimated Delivery: ${
        metadata.buyer.service === "Portharcourt"
          ? "1–3 days"
          : "2–5 days depending on your location"
      }</p>
    `;

    await transporter.sendMail({
      from: `"Dkikishop" <${process.env.SMTP_USER}>`,
      to: customer.email,
      subject: "Your Dkikishop Order Was Successful 🎉",
      html: customerHtml,
    });

    // ---------------- Email to admin ----------------
    const adminHtml = `
      <h2>New Order Received</h2>
      <p>Customer: ${metadata.buyer.name} (${customer.email})</p>
      <p>Phone: ${metadata.buyer.phone}</p>
      <p>Order Reference: <strong>${reference}</strong></p>
      <p>Delivery Service: <strong>${metadata.buyer.service}</strong></p>
      ${
        metadata.buyer.service === "Portharcourt"
          ? `<p>PortHarcourt Option: <strong>${metadata.buyer.portDeliveryOption}</strong></p>`
          : ""
      }
      <p>Shipping Address: ${metadata.buyer.address}, ${metadata.buyer.town}</p>
      <ul>
        ${items
          .map(
            (i) =>
              `<li>${i.quantity} × ${i.title} (₦${i.price.toLocaleString()})</li>`
          )
          .join("")}
      </ul>
      <p><strong>Total Paid: ₦${metadata.totalAmount.toLocaleString()}</strong></p>
    `;

    await transporter.sendMail({
      from: `"Dkikishop" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 New Order Received: ${reference}`,
      html: adminHtml,
    });

    return new Response(
      JSON.stringify({ message: "Webhook processed successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed", details: err.message }),
      { status: 500 }
    );
  }
}
