import EditProductForm from "./editproductform";
import { notFound } from "next/navigation";
import Product from "@/models/productModel"; // Renamed for clarity
import dbConnect from '@/lib/mongodb';

export default async function EditProductPage({ params }) {
  const { id } = await Promise.resolve(params);


  try {
    await dbConnect();
    const productData = await Product.findById(id).lean();


    if (!productData) {
      notFound(); // shows Next.js 404 page
    }

    productData._id = productData._id.toString();
    return <EditProductForm product={productData} />;
  } catch (err) {
    console.error("Error loading product:", err);
    notFound(); // also handles DB failures
  }
}
