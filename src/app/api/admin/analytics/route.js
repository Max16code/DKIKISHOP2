import dbConnect from '@/utils/db';
import Order from '@/models/orderModel';
import Product from '@/models/productModel';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Check admin authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date range from query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end day
      dateFilter = {
        createdAt: {
          $gte: start,
          $lte: end
        }
      };
    }

    await dbConnect();

    // Get orders with date filter
    const orders = await Order.find({
      paymentStatus: 'successful',
      ...dateFilter
    }).sort({ createdAt: -1 }).lean();

    // Get all product IDs from orders
    const productIds = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId) {
          productIds.push(item.productId);
        }
      });
    });

    // Fetch all products to get their categories
    const products = await Product.find({
      _id: { $in: productIds }
    }).lean();

    // Create a map of productId -> category
    const productCategoryMap = {};
    products.forEach(product => {
      productCategoryMap[product._id.toString()] = product.category || 'Uncategorized';
    });

    // ---- 1. Category Distribution ----
    const categoryMap = {};
    const productMap = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        // Get category from product map, fallback to 'Uncategorized'
        const category = productCategoryMap[item.productId?.toString()] || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += item.quantity || 1;

        // Track top products
        const productKey = item.title || 'Unknown';
        if (!productMap[productKey]) {
          productMap[productKey] = 0;
        }
        productMap[productKey] += item.quantity || 1;
      });
    });

    // Convert category map to array for pie chart
    const categoryDistribution = Object.keys(categoryMap).map(category => ({
      name: category,
      value: categoryMap[category]
    })).sort((a, b) => b.value - a.value);

    // ---- 2. Top Products ----
    const topProducts = Object.keys(productMap)
      .map(name => ({
        name: name,
        value: productMap[name]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // ---- 3. Recent Orders ----
    const recentOrders = orders.slice(0, 20).map(order => ({
      customerName: order.customerName || 'Guest',
      itemCount: order.items?.length || 0,
      totalAmount: order.totalAmount || 0,
      status: order.status || 'pending',
      createdAt: order.createdAt
    }));

    // ---- 4. Summary Stats ----
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return NextResponse.json({
      categoryDistribution,
      topProducts,
      recentOrders,
      totalOrders,
      totalRevenue,
      dateRange: { startDate, endDate }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}