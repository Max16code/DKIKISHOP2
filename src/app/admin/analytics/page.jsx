'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

// Color palette for categories
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894',
  '#E17055', '#74B9FF', '#FDCB6E', '#6C5CE7', '#00CEC9',
];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    categoryDistribution: [],
    totalOrders: 0,
    totalRevenue: 0,
    topProducts: [],
    recentOrders: [],
  });

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Analytics error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Quick date range presets
  const setDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition text-sm font-semibold"
          >
            Refresh Data
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDateRange(7)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange(30)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateRange(90)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
              >
                Last 90 Days
              </button>
              <button
                onClick={() => setDateRange(365)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
              >
                Last Year
              </button>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-3xl font-bold text-yellow-400">{analytics.totalOrders}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-400">₦{analytics.totalRevenue.toLocaleString()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <p className="text-gray-400 text-sm">Categories</p>
            <p className="text-3xl font-bold text-blue-400">{analytics.categoryDistribution.length}</p>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart - Category Distribution */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold mb-4 text-yellow-400">🛍️ Category Distribution</h2>
            <p className="text-sm text-gray-400 mb-4">Items bought by category</p>
            
            {analytics.categoryDistribution.length === 0 ? (
              <div className="h-[350px] flex items-center justify-center">
                <p className="text-gray-500">No data for this period</p>
              </div>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {analytics.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value, name) => [`${value} items`, name]}
                    />
                    <Legend 
                      formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Top Products */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold mb-4 text-yellow-400">🏆 Top Products</h2>
            <p className="text-sm text-gray-400 mb-4">Most purchased items</p>
            
            {analytics.topProducts.length === 0 ? (
              <div className="h-[350px] flex items-center justify-center">
                <p className="text-gray-500">No data for this period</p>
              </div>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#888"
                      width={100}
                      tick={{ fill: '#ccc', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value, name) => [`${value} units`, name]}
                    />
                    <Bar dataKey="value" fill="#FFD93D" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold mb-4 text-yellow-400">📋 Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 font-semibold text-gray-400">Customer</th>
                  <th className="pb-3 font-semibold text-gray-400">Items</th>
                  <th className="pb-3 font-semibold text-gray-400">Total</th>
                  <th className="pb-3 font-semibold text-gray-400">Status</th>
                  <th className="pb-3 font-semibold text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">No orders in this period</td>
                  </tr>
                ) : (
                  analytics.recentOrders.map((order, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3">{order.customerName}</td>
                      <td className="py-3">{order.itemCount} items</td>
                      <td className="py-3 text-green-400">₦{order.totalAmount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}