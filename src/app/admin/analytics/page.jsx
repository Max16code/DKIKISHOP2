// src/app/admin/analytics/page.jsx
// SERVER COMPONENT – auth + data fetch
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/orderModel';
import AnalyticsChart from './AnalyticsChart'; // create this next

export default async function AnalyticsPage({ searchParams }) {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect('/admin/login');
  }

  await dbConnect();

  // Date filter (default: last 365 days)
  const endDate = searchParams.end ? new Date(searchParams.end) : new Date();
  const startDate = searchParams.start
    ? new Date(searchParams.start)
    : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

  const orders = await Order.find({
    paymentStatus: 'successful',
    paidAt: { $gte: startDate, $lte: endDate },
  }).lean();

  // Aggregate sales by category
  const categoryStats = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { revenue: 0 };
      }
      categoryStats[cat].revenue += item.price * item.quantity;
    });
  });

  const chartData = Object.entries(categoryStats).map(([name, stats]) => ({
    name,
    value: stats.revenue
  })).sort((a, b) => b.value - a.value);

  const totalRevenue = chartData.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sales by Category</h1>

      {/* Date filter */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl mb-4">Period</h2>
        <form className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm mb-1">Start Date</label>
            <input
              type="date"
              name="start"
              defaultValue={startDate.toISOString().split('T')[0]}
              className="bg-gray-700 p-2 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">End Date</label>
            <input
              type="date"
              name="end"
              defaultValue={endDate.toISOString().split('T')[0]}
              className="bg-gray-700 p-2 rounded text-white"
            />
          </div>
          <button
            type="submit"
            className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
          >
            Apply
          </button>
        </form>

        <div className="mt-4 text-lg">
          Total Revenue: <strong>₦{totalRevenue.toLocaleString()}</strong>
        </div>
      </div>

      <AnalyticsChart chartData={chartData} totalRevenue={totalRevenue} />
    </div>
  );
}