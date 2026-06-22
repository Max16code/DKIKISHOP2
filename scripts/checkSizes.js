// scripts/checkSizes.js
import connectDB from '../src/lib/mongodb.js';
import Product from '../src/models/productModel.js';

async function check() {
  await connectDB();
  const products = await Product.find({}).limit(5);
  products.forEach(p => {
    console.log(`Product: ${p.title}`);
    console.log(`sizes:`, p.sizes);
    console.log(`stock:`, p.stock);
    console.log('---');
  });
  process.exit(0);
}
check();