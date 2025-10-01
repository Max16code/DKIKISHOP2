// /src/app/api/products/cloudinary/route.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req) {
  try {
    // Fetch all images from the "products" folder
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: "products/", // folder structure: products/category_name/image
      max_results: 500,
    });

    const products = resources.resources.map((res) => ({
      id: res.asset_id,
      title: res.public_id.split("/").pop(),
      image: res.secure_url,
      category: res.folder.split("/")[1] || "uncategorized", // products/category_name
    }));

    return new Response(JSON.stringify(products), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
