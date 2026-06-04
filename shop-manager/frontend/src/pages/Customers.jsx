import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserGroupIcon, ShoppingBagIcon, PhoneIcon, EnvelopeIcon, 
  ChevronRightIcon, MagnifyingGlassIcon, ArrowPathIcon,
  ClockIcon, BanknotesIcon, CalendarIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';
import { cn } from '../utils/cn';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Backend should have a GET /customers endpoint.
      // If not, I'll create one or use existing search.
      const res = await axiosClient.get('/customers/'); 
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (customerId) => {
    setHistoryLoading(true);
    try {
      const res = await axiosClient.get(`/invoices/customer/${customerId}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    fetchHistory(customer.id);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Customer Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage profiles and view purchase history.</p>
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 transition-all text-sm w-64 shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        
        {/* CUSTOMER LIST */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">All Customers</h2>
            <span className="text-xs font-bold text-slate-400">{filteredCustomers.length}</span>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="p-10 text-center"><ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-slate-300" /></div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm italic">No customers found.</div>
            ) : (
              filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className={cn(
                    "w-full p-4 flex items-center gap-4 transition-all border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left",
                    selectedCustomer?.id === customer.id ? "bg-teal-50 dark:bg-teal-500/10 border-r-4 border-r-teal-500" : ""
                  )}
                >
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                    {customer.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{customer.name}</h4>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* PURCHASE HISTORY */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
          {!selectedCustomer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-40">
              <UserGroupIcon className="w-20 h-20" />
              <p className="text-lg font-medium">Select a customer to view details</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header Info */}
              <div className="p-8 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-transparent border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-teal-500 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-teal-500/20">
                      {selectedCustomer.name[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedCustomer.name}</h2>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <PhoneIcon className="w-4 h-4" /> {selectedCustomer.phone}
                        </span>
                        {selectedCustomer.email && (
                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <EnvelopeIcon className="w-4 h-4" /> {selectedCustomer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                    <p className="text-3xl font-black text-teal-600 dark:text-teal-400">₹{selectedCustomer.total_purchases.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="p-6 flex-1 overflow-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                     <ClockIcon className="w-5 h-5 text-teal-500" /> Purchase History
                   </h3>
                   <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                     {history.length} Invoices
                   </div>
                </div>

                {historyLoading ? (
                  <div className="py-20 text-center"><ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-slate-300" /></div>
                ) : history.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 italic">No purchase history found for this customer.</div>
                ) : (
                  <div className="space-y-4">
                    {history.sort((a,b) => new Date(b.date) - new Date(a.date)).map(inv => (
                      <div key={inv.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Order {inv.invoice_number}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                               <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                 {new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                               </p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-black text-slate-900 dark:text-white">₹{inv.total.toLocaleString()}</p>
                             <span className="text-[10px] font-bold text-slate-400 uppercase">{inv.payment_mode}</span>
                          </div>
                        </div>
                        
                        {/* Items Preview */}
                        <div className="flex flex-wrap gap-2">
                           {inv.items.map((item, idx) => (
                             <span key={idx} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-md border border-slate-100 dark:border-slate-700">
                               {item.product?.name || 'Product'} (x{item.quantity})
                             </span>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
