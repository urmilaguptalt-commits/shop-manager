import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOfficeIcon, PlusIcon, PhoneIcon, EnvelopeIcon, 
  ShoppingCartIcon, DocumentTextIcon, XMarkIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import axiosClient from '../api/axiosClient';

export default function Suppliers() {
  const [activeTab, setActiveTab] = useState('directory'); // directory or pos (Purchase Orders)
  
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  // Form states - Add Supplier
  const [newSupplier, setNewSupplier] = useState({
    name: '', contact_person: '', phone: '', email: '', category: ''
  });

  // Form states - Create PO
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poExpectedDelivery, setPoExpectedDelivery] = useState('');
  const [poItems, setPoItems] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);

  const fetchData = async () => {
    try {
      const [supRes, poRes, prodRes] = await Promise.all([
        axiosClient.get('/suppliers/'),
        axiosClient.get('/purchases/'),
        axiosClient.get('/products/')
      ]);
      setSuppliers(supRes.data);
      setPurchaseOrders(poRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isCreatePOModalOpen) {
      // Calculate random date between 15 and 20 days from now
      const daysToAdd = Math.floor(Math.random() * 6) + 15; // 15, 16, 17, 18, 19, 20
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + daysToAdd);
      
      // Format to YYYY-MM-DD
      const formattedDate = expectedDate.toISOString().split('T')[0];
      setPoExpectedDelivery(formattedDate);
    }
  }, [isCreatePOModalOpen]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.phone || !newSupplier.contact_person) {
      alert("Please fill in Company Name, Contact Person, and Phone.");
      return;
    }
    try {
      await axiosClient.post('/suppliers/', newSupplier);
      setIsAddSupplierModalOpen(false);
      setNewSupplier({ name: '', contact_person: '', phone: '', email: '', category: '' });
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error adding supplier:", error);
      const msg = error?.response?.data?.detail || "Failed to add supplier. Please try again.";
      alert(msg);
    }
  };

  const handleAddPoItem = () => {
    setPoItems([...poItems, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemovePoItem = (index) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handlePoItemChange = (index, field, value) => {
    const updated = [...poItems];
    updated[index][field] = value;
    
    // Auto-fill unit price if product is selected
    if (field === 'product_id') {
       const prod = products.find(p => p.id === parseInt(value));
       if (prod) {
          updated[index].unit_price = prod.cost_price || 0;
       }
    }
    setPoItems(updated);
  };

  const poTotalAmount = poItems.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0);

  const handleCreatePO = async () => {
    if (!poSupplierId) {
       alert("Please select a supplier");
       return;
    }
    
    const itemsPayload = poItems.filter(item => item.product_id).map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        total_price: (parseInt(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
    }));
    
    if (itemsPayload.length === 0) {
       alert("Please add at least one valid product");
       return;
    }

    const payload = {
       supplier_id: parseInt(poSupplierId),
       total_amount: poTotalAmount,
       expected_delivery: poExpectedDelivery ? new Date(poExpectedDelivery).toISOString() : null,
       items: itemsPayload
    };

    try {
       await axiosClient.post('/purchases/', payload);
       setIsCreatePOModalOpen(false);
       setPoSupplierId('');
       setPoItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
       fetchData(); // Refresh list
    } catch (error) {
       console.error("Error creating PO:", error);
       alert("Failed to create Purchase Order.");
    }
  };

  return (
    <div className="h-full flex flex-col relative pb-8">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Suppliers & PO</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage vendors and purchase new stock for inventory.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddSupplierModalOpen(true)}
            className="btn-secondary gap-2"
          >
            <BuildingOfficeIcon className="w-5 h-5" />
            Add Supplier
          </button>
          <button 
            onClick={() => setIsCreatePOModalOpen(true)}
            className="btn-primary gap-2 shadow-lg shadow-teal-500/20"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button 
          onClick={() => setActiveTab('directory')}
          className={cn(
            "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative",
            activeTab === 'directory' ? "text-teal-600 dark:text-teal-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Supplier Directory
          {activeTab === 'directory' && <motion.div layoutId="supplyTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('pos')}
          className={cn(
            "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative",
            activeTab === 'pos' ? "text-teal-600 dark:text-teal-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Purchase Orders
          {activeTab === 'pos' && <motion.div layoutId="supplyTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />}
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === 'directory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((sup, idx) => (
            <motion.div 
              key={sup.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
              className="glass-surface p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-lg">
                    <BuildingOfficeIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                 </div>
                 <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {sup.category}
                 </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-teal-500 transition-colors">{sup.name}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Contact: <span className="text-slate-700 dark:text-slate-300">{sup.contact_person}</span></p>
              
              <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 focus-within:text-teal-500">
                    <PhoneIcon className="w-4 h-4" /> {sup.phone}
                 </div>
                 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <EnvelopeIcon className="w-4 h-4" /> {sup.email}
                 </div>
              </div>
            </motion.div>
          ))}
          {suppliers.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500">
              No suppliers found. Add a new supplier to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">

          {/* Recently Purchased Summary Cards */}
          {purchaseOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <ShoppingCartIcon className="w-4 h-4 text-teal-500" />
                Recently Purchased Items
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchaseOrders.slice(0, 3).map((po) => (
                  <motion.div
                    key={`recent-${po.id}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedPO(po)}
                    className="cursor-pointer glass-surface p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{po.po_number}</span>
                      <span className="text-xs text-slate-400">{new Date(po.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      🏢 {po.supplier?.name || 'Unknown Supplier'}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 space-y-0.5">
                      {po.items?.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>• {item.product?.name || `Product #${item.product_id}`}</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">×{item.quantity}</span>
                        </div>
                      ))}
                      {po.items?.length > 2 && <div className="text-teal-500">+{po.items.length - 2} more items</div>}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">{po.status}</span>
                      <span className="font-black text-slate-800 dark:text-white">₹{po.total_amount.toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Full PO Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />
              All Purchase Orders
            </h3>
            <div className="glass-surface rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-xl">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">PO Number</th>
                        <th className="py-4 px-6">Supplier</th>
                        <th className="py-4 px-6">Products Ordered</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Total Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     {purchaseOrders.map((po) => (
                       <tr key={po.id} onClick={() => setSelectedPO(po)} className="cursor-pointer border-b border-slate-100 dark:border-slate-800 hover:bg-teal-50/40 dark:hover:bg-teal-500/5 transition-colors">
                          <td className="py-4 px-6 font-mono text-sm text-teal-600 dark:text-teal-400 font-bold">{po.po_number}</td>
                          <td className="py-4 px-6 font-medium text-slate-800 dark:text-white">{po.supplier?.name || 'Unknown'}</td>
                          <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">
                            {po.items?.length > 0
                              ? po.items.map(i => i.product?.name || `#${i.product_id}`).join(', ')
                              : <span className="italic">No items</span>
                            }
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-500">{new Date(po.date).toLocaleDateString('en-IN')}</td>
                          <td className="py-4 px-6">
                             <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-500/20">{po.status}</span>
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-slate-800 dark:text-white">₹{po.total_amount.toLocaleString()}</td>
                       </tr>
                     ))}
                     {purchaseOrders.length === 0 && (
                       <tr>
                         <td colSpan="6" className="py-8 text-center text-slate-500">No Purchase Orders found. Create your first PO above.</td>
                       </tr>
                     )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      <AnimatePresence>
        {isAddSupplierModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setIsAddSupplierModalOpen(false)}
          >
             <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
             >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add New Supplier</h2>
                   <button onClick={() => setIsAddSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                      <input type="text" className="input-field" placeholder="Samsung Electronics" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                      <input type="text" className="input-field" placeholder="Ramesh Kumar" value={newSupplier.contact_person} onChange={e => setNewSupplier({...newSupplier, contact_person: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                         <input type="text" className="input-field" placeholder="+91..." value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                         <input type="email" className="input-field" placeholder="email@example.com" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                      <input type="text" className="input-field" placeholder="Smartphones" value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})} />
                   </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                   <button onClick={() => setIsAddSupplierModalOpen(false)} className="btn-secondary">Cancel</button>
                   <button onClick={handleAddSupplier} className="btn-primary">Save Supplier</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE PO MODAL */}
      <AnimatePresence>
        {isCreatePOModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setIsCreatePOModalOpen(false)}
          >
             <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                   <div>
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create Purchase Order</h2>
                     <p className="text-xs text-slate-500">Add new items. Stock will automatically increase upon submission.</p>
                   </div>
                   <button onClick={() => setIsCreatePOModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-6 flex-1 overflow-auto space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Supplier</label>
                         <select className="input-field" value={poSupplierId} onChange={e => setPoSupplierId(e.target.value)}>
                            <option value="">Select Supplier...</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Delivery</label>
                         <input type="date" className="input-field" value={poExpectedDelivery} onChange={e => setPoExpectedDelivery(e.target.value)} />
                      </div>
                   </div>

                   <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Order Items</h4>
                      
                      <div className="space-y-3">
                         {poItems.map((item, index) => (
                           <div key={index} className="flex gap-3 items-center p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                              <select className="input-field flex-1" value={item.product_id} onChange={e => handlePoItemChange(index, 'product_id', e.target.value)}>
                                  <option value="">Select Product...</option>
                                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                              <input type="number" placeholder="Qty" className="input-field w-24" value={item.quantity} onChange={e => handlePoItemChange(index, 'quantity', e.target.value)} />
                              <input type="number" placeholder="Cost Price" className="input-field w-32" value={item.unit_price} onChange={e => handlePoItemChange(index, 'unit_price', e.target.value)} />
                              <button onClick={() => handleRemovePoItem(index)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><XMarkIcon className="w-5 h-5"/></button>
                           </div>
                         ))}
                         
                         <button onClick={handleAddPoItem} className="text-sm font-medium text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-2 hover:underline">
                            <PlusIcon className="w-4 h-4"/> Add another item
                         </button>
                      </div>
                   </div>
                   
                   <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl flex justify-between items-center border border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-600 dark:text-slate-300">Total Purchase Value</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">₹{poTotalAmount.toLocaleString()}</span>
                   </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 drop-shadow-2xl">
                   <button onClick={() => setIsCreatePOModalOpen(false)} className="btn-secondary">Cancel</button>
                   <button onClick={handleCreatePO} className="btn-primary">Confirm & Create PO</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PO DETAILS MODAL */}
      <AnimatePresence>
        {selectedPO && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setSelectedPO(null)}
          >
             <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                   <div>
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white">Purchase Order Details: {selectedPO.po_number}</h2>
                     <p className="text-xs text-slate-500">Supplier: {selectedPO.supplier?.name} | Date: {new Date(selectedPO.date).toLocaleDateString()}</p>
                   </div>
                   <button onClick={() => setSelectedPO(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-6 flex-1 overflow-auto space-y-6">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Purchased Products</h4>
                    <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              <th className="py-3 px-4">Product Name</th>
                              <th className="py-3 px-4 text-center">Quantity</th>
                              <th className="py-3 px-4 text-right">Unit Price</th>
                              <th className="py-3 px-4 text-right">Total Price</th>
                           </tr>
                        </thead>
                        <tbody>
                           {selectedPO.items?.map((item, idx) => (
                             <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{item.product?.name || `Product ID ${item.product_id}`}</td>
                                <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">{item.quantity}</td>
                                <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">₹{item.unit_price.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">₹{item.total_price.toLocaleString()}</td>
                             </tr>
                           ))}
                           {(!selectedPO.items || selectedPO.items.length === 0) && (
                             <tr>
                               <td colSpan="4" className="py-4 text-center text-slate-500">No items found in this order.</td>
                             </tr>
                           )}
                        </tbody>
                    </table>
                    <div className="mt-4 text-right text-lg font-black text-slate-900 dark:text-white">
                       Total Value: ₹{selectedPO.total_amount.toLocaleString()}
                    </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

