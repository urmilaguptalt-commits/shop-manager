import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  CubeIcon, ExclamationTriangleIcon, BanknotesIcon, ArrowTrendingUpIcon, PlusIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import { useCart } from '../context/CartContext';
import axiosClient from '../api/axiosClient';

const metricsData = [
  { title: 'Total Stock Value', value: '₹ 84.5M', change: '+12.5%', isUp: true, icon: BanknotesIcon },
  { title: 'Active Units', value: '1,248', change: '+5.2%', isUp: true, icon: CubeIcon },
  { title: 'Low Stock Alerts', value: '14', change: '-2.1%', isUp: false, icon: ExclamationTriangleIcon },
  { title: 'Monthly Revenue', value: '₹ 12.2M', change: '+18.4%', isUp: true, icon: ArrowTrendingUpIcon },
];

const areaData = [
  { name: 'Jan', sales: 4000, purchases: 2400 },
  { name: 'Feb', sales: 3000, purchases: 1398 },
  { name: 'Mar', sales: 2000, purchases: 9800 },
  { name: 'Apr', sales: 2780, purchases: 3908 },
  { name: 'May', sales: 1890, purchases: 4800 },
  { name: 'Jun', sales: 2390, purchases: 3800 },
  { name: 'Jul', sales: 3490, purchases: 4300 },
];

const doughnutData = [
  { name: 'Laptops', value: 400 },
  { name: 'Smartphones', value: 300 },
  { name: 'Accessories', value: 300 },
  { name: 'Wearables', value: 200 },
];
const COLORS = ['#14b8a6', '#0ea5e9', '#6366f1', '#a855f7'];


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-surface p-3 rounded-lg border border-slate-700/50 shadow-xl bg-slate-900/90 text-sm">
        <p className="text-slate-300 mb-1 font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [premiumProducts, setPremiumProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get('/products/');
      // Take first 10 products as "premium" for showcase
      setPremiumProducts(res.data);
    } catch (err) {
      console.error("Dashboard: Failed to fetch products", err);
    }
  };

  const metricsData = [
    { title: 'Total Stock Items', value: premiumProducts.length, change: '+5.2%', isUp: true, icon: CubeIcon },
    { title: 'Low Stock Alerts', value: premiumProducts.filter(p => p.stock_qty <= p.min_stock).length, change: 'Requires Action', isUp: false, icon: ExclamationTriangleIcon },
    { title: 'Inventory Value', value: `₹ ${(premiumProducts.reduce((acc, p) => acc + (p.price * p.stock_qty), 0) / 100000).toFixed(1)}L`, change: '+12.5%', isUp: true, icon: BanknotesIcon },
    { title: 'Monthly Revenue', value: '₹ 1.2M', change: '+18.4%', isUp: true, icon: ArrowTrendingUpIcon },
  ];

  const lowStockItems = premiumProducts.filter(p => p.stock_qty <= p.min_stock).slice(0, 5);

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
            Executive Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Real-time business intelligence & inventory metrics.
          </p>
        </div>
      </motion.div>

      {/* BENTO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="group relative overflow-hidden rounded-2xl p-6 glass-surface bg-white/5 dark:bg-slate-800/40 hover:bg-white/10 dark:hover:bg-slate-800/60 transition-all border border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all duration-500"/>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 shadow-inner">
                <item.icon className={cn("w-6 h-6", item.title === 'Low Stock Alerts' && item.value > 0 ? "text-red-500 animate-pulse" : "text-teal-600 dark:text-teal-400")} />
              </div>
              <span className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-full",
                item.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {item.change}
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.title}</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{item.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS & LOW STOCK SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-3xl p-6 glass-surface bg-white/5 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Revenue vs Procurement</h3>
            <div className="flex gap-4 text-xs font-medium">
               <span className="flex items-center gap-1.5 text-teal-500"><div className="w-2 h-2 rounded-full bg-teal-500"/> Revenue</span>
               <span className="flex items-center gap-1.5 text-indigo-500"><div className="w-2 h-2 rounded-full bg-indigo-500"/> Procurement</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val)=>`₹${val/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="purchases" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="rounded-3xl p-6 glass-surface bg-white/5 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Critical Stock Alerts</h3>
          <div className="flex-1 space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 group hover:border-red-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-bold">
                    {item.stock_qty}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Min: {item.min_stock}</p>
                  </div>
                  <button className="text-[10px] font-black text-teal-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    REORDER
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-500">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">All stock levels are healthy</p>
              </div>
            )}
          </div>
          {lowStockItems.length > 0 && (
            <button className="mt-6 w-full py-3 rounded-xl bg-[#111827] text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
              View All Alerts
            </button>
          )}
        </motion.div>
      </div>

      {/* SHOWCASE SECTION */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 pt-6">Premium Machine Showcase</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {premiumProducts.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="group cursor-pointer rounded-2xl overflow-hidden glass-surface border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 transform hover:-translate-y-2 bg-slate-100 dark:bg-slate-800/50 flex flex-col"
            >
              <div className="h-48 w-full overflow-hidden relative">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wider uppercase mb-1">{product.category}</p>
                  <h4 className="text-slate-900 dark:text-white font-semibold line-clamp-1">{product.name}</h4>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">₹{product.price.toLocaleString()}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-500 hover:text-white"
                  >
                    <PlusIcon className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAB Quick Add */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-teal-500 hover:bg-teal-400 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] transition-all z-50 hover:scale-110 active:scale-95">
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
