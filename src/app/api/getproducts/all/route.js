// src/app/api/getproducts/all/route.js
import dbConnect from '@/lib/mongodb'
import Product from "@/models/productModel";
import { NextResponse } from "next/server";

// ── Simple in-memory rate limiter (no Redis, no external deps) ──────────────────
const rateLimitMap = new Map(); // key: IP, value: { count, resetTime }

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 60 seconds
  const maxRequests = 10;     // adjust as needed

  let entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + windowMs };
    rateLimitMap.set(ip, entry);
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: maxRequests - entry.count };
}

// Optional: clean up old entries every 2 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 2 * 60 * 1000);

// ── CORS handlers ────────────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',  // Replace with your domain in production
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request) {
  // CORS headers to include in all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',  // Replace with your domain in production
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rate = checkRateLimit(ip);

  if (!rate.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests — please try again in a minute' },
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Availability filter (commented out in your version — kept as-is)
    const available = searchParams.get('available') === 'true';

    // Limit handling – support unlimited with ?limit=0 or ?limit=all
    const limitParam = searchParams.get('limit');
    let limit = 50; // default for safety

    if (limitParam !== null) {
      if (limitParam === '0' || limitParam === 'all' || limitParam === 'none') {
        limit = 0; // 0 = no limit → returns everything
      } else {
        limit = parseInt(limitParam, 10) || 50;
      }
    }

    const query = {};

    // if (available) {
    //   query.isAvailable = true;
    //   query.stock = { $gt: 0 };
    // }

    // Fetch products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        products,
        total,
        returned: products.length,
        limitUsed: limit === 0 ? 'unlimited' : limit,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products: " + error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}