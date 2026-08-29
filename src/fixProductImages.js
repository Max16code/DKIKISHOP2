import 'dotenv/config'; // automatically load .env
import mongoose from "mongoose";


const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

async function fixImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB ✅");

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      if (!product.images || !Array.isArray(product.images)) continue;

      const fixedImages = product.images.map(img =>
        img.startsWith("/https://") ? img.slice(1) : img
      );

      if (JSON.stringify(fixedImages) !== JSON.stringify(product.images)) {
        product.images = fixedImages;
        await product.save();
        console.log(`✅ Fixed product: ${product.title}`);
      }
    }

    console.log("✅ All product images fixed!");
  } catch (err) {
    console.error("❌ Error fixing images:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB ✅");
  }
}

fixImages();
