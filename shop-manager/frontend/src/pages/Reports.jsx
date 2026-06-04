import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DocumentArrowDownIcon, PrinterIcon, EyeIcon } from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';

const pnlData = [
  { name: 'Jan', profit: 4000, revenue: 12000 },
  { name: 'Feb', profit: 3000, revenue: 11000 },
  { name: 'Mar', profit: 2000, revenue: 9800 },
  { name: 'Apr', profit: 2780, revenue: 13908 },
  { name: 'May', profit: 4890, revenue: 16800 },
  { name: 'Jun', profit: 5390, revenue: 18800 },
];

export default function Reports() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axiosClient.get('/invoices/');
      setInvoices(res.data);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    }
  };

  const handleReprint = (invoice) => {
    const win = window.open('', '_blank', 'width=400,height=600');
    const itemsHtml = invoice.items.map(item => `
      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
        <span>${item.product.name} (x${item.quantity})</span>
        <span style="font-weight:bold;">₹${item.total_price.toLocaleString()}</span>
      </div>
    `).join('');

    win.document.write(`
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; font-size: 12px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h3 { margin: 0; font-size: 18px; }
            .hr { border-top: 1px dashed #ccc; margin: 15px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .bold { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>SHOP MANAGER PRO</h3>
            <p>Tax Invoice: ${invoice.invoice_number}</p>
            <p>${new Date(invoice.date).toLocaleString()}</p>
          </div>
          <div class="hr"></div>
          <div>
            <p><b>Customer:</b> ${invoice.customer?.name || 'Walk-in'}</p>
            <p><b>Phone:</b> ${invoice.customer?.phone || 'N/A'}</p>
          </div>
          <div class="hr"></div>
          ${itemsHtml}
          <div class="hr"></div>
          <div class="row"><span>Subtotal</span><span>₹${invoice.subtotal.toLocaleString()}</span></div>
          <div class="row"><span>GST (18%)</span><span>₹${invoice.gst_amount.toLocaleString()}</span></div>
          <div class="row bold" style="font-size:14px; border-top:1px solid #000; padding-top:10px; margin-top:10px;">
            <span>TOTAL</span>
            <span>₹${invoice.total.toLocaleString()}</span>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer generated invoice.</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Business Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
             <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">Last 30 Days</span>
             <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-xs text-slate-400 font-semibold cursor-pointer border border-slate-200 dark:border-slate-800 hover:text-slate-600 transition">This Year</span>
          </p>
        </div>
        <div className="flex gap-3">
           <button className="btn-secondary gap-2"><PrinterIcon className="w-5 h-5"/> Print Reports</button>
           <button className="btn-primary gap-2 shadow-lg shadow-teal-500/20"><DocumentArrowDownIcon className="w-5 h-5"/> Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* P&L CHART */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 glass-surface rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Profit & Loss Analysis</h3>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pnlData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </motion.div>

        {/* RECENT INVOICES */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 glass-surface rounded-3xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col shadow-xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Automated Invoices</h3>
              <button onClick={fetchInvoices} className="text-xs font-bold text-teal-500 uppercase tracking-widest hover:underline">Refresh</button>
           </div>
           <div className="flex-1 overflow-auto max-h-[350px] custom-scrollbar">
              <table className="w-full text-left">
                 <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest">
                       <th className="pb-3 font-semibold">Invoice #</th>
                       <th className="pb-3 font-semibold">Customer</th>
                       <th className="pb-3 font-semibold">Total</th>
                       <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invoices.map((inv) => (
                       <tr key={inv.id} className="text-sm group">
                          <td className="py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{inv.invoice_number}</td>
                          <td className="py-4">
                             <p className="font-bold text-slate-800 dark:text-slate-200">{inv.customer?.name || 'Walk-in'}</p>
                             <p className="text-[10px] text-slate-400">{new Date(inv.date).toLocaleDateString()}</p>
                          </td>
                          <td className="py-4 font-bold text-slate-800 dark:text-slate-200">₹{inv.total.toLocaleString()}</td>
                          <td className="py-4 text-right">
                             <button 
                                onClick={() => handleReprint(inv)}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all"
                                title="Reprint Invoice"
                             >
                                <PrinterIcon className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
