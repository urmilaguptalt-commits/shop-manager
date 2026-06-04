import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon,
  ChevronRightIcon, PlusIcon
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import axiosClient from '../api/axiosClient';

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '', brand: '', sku: '', category: 'Electronics', price: '', cost_price: '', min_stock: '10'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get('/products/');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const handleAddProduct = async () => {
    try {
      const payload = {
        name: formData.name,
        brand: formData.brand,
        sku: formData.sku,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock_qty: 0,
        min_stock: parseInt(formData.min_stock) || 10
      };
      await axiosClient.post('/products/', payload);
      setIsAddModalOpen(false);
      setFormData({ name: '', brand: '', sku: '', category: 'Electronics', price: '', cost_price: '', min_stock: '10' });
      fetchProducts();
    } catch (err) {
      console.error("Failed to add product", err);
      alert("Failed to add product. Make sure you are logged in as admin/owner.");
    }
  };

  return (
    <div className="h-full flex flex-col relative pb-8">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Inventory Master</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage products, serial numbers, and specifications.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary gap-2 shadow-lg shadow-teal-500/20">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md group">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, SKU, or brand..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-800 dark:text-slate-200 shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="flex-1 glass-surface rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-xl flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Price</th>
                <th className="py-4 px-6 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())).map((p, idx) => {
                const status = p.stock_qty <= 0 ? "Out of Stock" : (p.stock_qty <= p.min_stock ? "Low Stock" : "In Stock");
                return (
                <motion.tr 
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedProduct(p)}
                  className="cursor-pointer border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.brand}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 font-mono">{p.sku}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-200 font-semibold">{p.stock_qty}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border",
                      status === "In Stock" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" :
                      status === "Low Stock" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" :
                      "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                    )}>
                      {status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-slate-800 dark:text-white">₹{p.price.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right">
                    <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                  </td>
                </motion.tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE OUT DRAWER */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Details</h2>
                <button onClick={() => setSelectedProduct(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-auto space-y-8">
                <div>
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">{selectedProduct.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedProduct.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{selectedProduct.brand}</p>
                      <div className="mt-2">
                         <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                           {selectedProduct.sku}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Selling Price</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{selectedProduct.price}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Stock Level</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{selectedProduct.stock_qty} Units</p>
                  </div>
                </div>

                {/* Specs Section mock */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Technical Specs</h4>
                  <div className="space-y-3">
                     {["Processor: M2 Pro", "RAM: 16GB Unified", "Storage: 512GB SSD"].map(spec => (
                        <div key={spec} className="flex justify-between text-sm">
                           <span className="text-slate-500 dark:text-slate-400">{spec.split(':')[0]}</span>
                           <span className="font-medium text-slate-800 dark:text-slate-200">{spec.split(':')[1]}</span>
                        </div>
                     ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <button className="flex-1 btn-primary">Edit Product</button>
                <button className="px-6 py-2 rounded-lg font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ADD PRODUCT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
              onClick={() => setIsAddModalOpen(false)}
            >
               <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
               >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add New Product</h2>
                     <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                        <input type="text" className="input-field" placeholder="Legion Pro Max" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                           <input type="text" className="input-field" placeholder="Lenovo" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                           <input type="text" className="input-field" placeholder="LPM-900" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                           <input type="text" className="input-field" placeholder="Laptop" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price</label>
                           <input type="number" className="input-field" placeholder="145000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost Price</label>
                           <input type="number" className="input-field" placeholder="120000" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Stock Level</label>
                           <input type="number" className="input-field" placeholder="10" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})} />
                        </div>
                     </div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                     <button onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Cancel</button>
                     <button onClick={handleAddProduct} className="btn-primary">Save Product</button>
                  </div>
               </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
