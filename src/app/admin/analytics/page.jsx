'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
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

  // Custom tooltip with percentages
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = analytics.categoryDistribution.reduce((sum, item) => sum + item.value, 0);
      const percent = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#1a1a2e] border border-[#333] rounded-lg p-3 text-white text-sm">
          <p className="font-bold text-yellow-400">{label}</p>
          <p>Items: <span className="font-bold">{payload[0].value}</span></p>
          <p>Percentage: <span className="font-bold text-green-400">{percent}%</span></p>
        </div>
      );
    }
    return null;
  };

  // ✅ FIXED: Custom label formatter for bar chart
  const renderBarLabel = (props) => {
    const { x, y, width, value, index } = props;
    const total = analytics.categoryDistribution.reduce((sum, item) => sum + item.value, 0);
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    
    return (
      <text
        x={x + width + 6}
        y={y + 12}
        fill="#FFD93D"
        fontSize={window.innerWidth < 640 ? 9 : 11}
        fontWeight="bold"
        textAnchor="start"
      >
        {percent}%
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-4 md:p-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm md:text-base">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-4 md:p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 md:p-6 text-center">
          <p className="text-red-400 text-sm md:text-base">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 md:px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition text-sm md:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate total for percentages
  const totalItems = analytics.categoryDistribution.reduce((sum, item) => sum + item.value, 0);

  // Prepare data for bar chart with colors
  const barChartData = analytics.categoryDistribution.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
    percent: totalItems > 0 ? ((item.value / totalItems) * 100).toFixed(1) : 0
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">📊 Analytics</h1>
          <button
            onClick={fetchAnalytics}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition text-xs md:text-sm font-semibold w-full sm:w-auto"
          >
            Refresh Data
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 mb-6 md:mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setDateRange(7)}
                className="px-2.5 md:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs md:text-sm transition whitespace-nowrap"
              >
                7 Days
              </button>
              <button
                onClick={() => setDateRange(30)}
                className="px-2.5 md:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs md:text-sm transition whitespace-nowrap"
              >
                30 Days
              </button>
              <button
                onClick={() => setDateRange(90)}
                className="px-2.5 md:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs md:text-sm transition whitespace-nowrap"
              >
                90 Days
              </button>
              <button
                onClick={() => setDateRange(365)}
                className="px-2.5 md:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs md:text-sm transition whitespace-nowrap"
              >
                1 Year
              </button>
            </div>
          </div>
          <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-gray-500">
            Showing: {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10"
          >
            <p className="text-gray-400 text-[10px] md:text-sm">Orders</p>
            <p className="text-xl md:text-3xl font-bold text-yellow-400">{analytics.totalOrders}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10"
          >
            <p className="text-gray-400 text-[10px] md:text-sm">Revenue</p>
            <p className="text-lg md:text-3xl font-bold text-green-400 truncate">₦{analytics.totalRevenue.toLocaleString()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 col-span-2 md:col-span-1"
          >
            <p className="text-gray-400 text-[10px] md:text-sm">Categories</p>
            <p className="text-xl md:text-3xl font-bold text-blue-400">{analytics.categoryDistribution.length}</p>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Category BAR CHART with Percentages */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10"
          >
            <h2 className="text-base md:text-xl font-bold mb-2 text-yellow-400">📊 Category Distribution</h2>
            <p className="text-[10px] md:text-sm text-gray-400 mb-3">Items sold by category with percentages</p>
            
            {barChartData.length === 0 ? (
              <div className="h-[280px] md:h-[350px] flex items-center justify-center">
                <p className="text-gray-500 text-sm">No data</p>
              </div>
            ) : (
              <div className="h-[280px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 60, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#888" 
                      fontSize={window.innerWidth < 640 ? 10 : 12}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#888"
                      width={window.innerWidth < 640 ? 70 : 100}
                      tick={{ 
                        fill: '#ccc', 
                        fontSize: window.innerWidth < 640 ? 10 : 12
                      }}
                      tickFormatter={(value) => {
                        return value.length > 12 ? value.substring(0, 10) + '...' : value;
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 4, 4, 0]}
                      label={renderBarLabel}
                    >
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Top Products */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10"
          >
            <h2 className="text-base md:text-xl font-bold mb-2 text-yellow-400">🏆 Top Products</h2>
            <p className="text-[10px] md:text-sm text-gray-400 mb-3">Most purchased items</p>
            
            {analytics.topProducts.length === 0 ? (
              <div className="h-[280px] md:h-[350px] flex items-center justify-center">
                <p className="text-gray-500 text-sm">No data</p>
              </div>
            ) : (
              <div className="h-[280px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={analytics.topProducts} 
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#888" 
                      fontSize={window.innerWidth < 640 ? 10 : 12}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#888"
                      width={window.innerWidth < 640 ? 70 : 100}
                      tick={{ 
                        fill: '#ccc', 
                        fontSize: window.innerWidth < 640 ? 10 : 12
                      }}
                      tickFormatter={(value) => {
                        return value.length > 15 ? value.substring(0, 12) + '...' : value;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`${value} units`]}
                      labelFormatter={(label) => `Product: ${label}`}
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
          className="mt-6 md:mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10"
        >
          <h2 className="text-base md:text-xl font-bold mb-3 text-yellow-400">📋 Recent Orders</h2>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <table className="min-w-full text-[10px] md:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-2 md:pb-3 font-semibold text-gray-400 pr-2">Customer</th>
                    <th className="pb-2 md:pb-3 font-semibold text-gray-400 pr-2 hidden sm:table-cell">Items</th>
                    <th className="pb-2 md:pb-3 font-semibold text-gray-400 pr-2">Total</th>
                    <th className="pb-2 md:pb-3 font-semibold text-gray-400 pr-2 hidden xs:table-cell">Status</th>
                    <th className="pb-2 md:pb-3 font-semibold text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-4 md:py-6 text-center text-gray-500 text-xs md:text-sm">No orders</td>
                    </tr>
                  ) : (
                    analytics.recentOrders.map((order, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-2 md:py-3 pr-2 max-w-[80px] truncate">{order.customerName}</td>
                        <td className="py-2 md:py-3 pr-2 hidden sm:table-cell">{order.itemCount}</td>
                        <td className="py-2 md:py-3 pr-2 text-green-400 text-[10px] md:text-sm">₦{order.totalAmount.toLocaleString()}</td>
                        <td className="py-2 md:py-3 pr-2 hidden xs:table-cell">
                          <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-2 md:py-3 text-gray-400 whitespace-nowrap text-[9px] md:text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}