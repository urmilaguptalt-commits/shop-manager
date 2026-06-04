import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon, BanknotesIcon, CreditCardIcon, BuildingLibraryIcon,
  UserIcon, PrinterIcon, XMarkIcon, CheckCircleIcon, 
  MapPinIcon, EnvelopeIcon, PhoneIcon, ChevronRightIcon,
  MagnifyingGlassIcon, PlusIcon, MinusIcon, TagIcon,
  CalculatorIcon, XCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import { useCart } from '../context/CartContext';
import axiosClient from '../api/axiosClient';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Cash',  Icon: BanknotesIcon },
  { id: 'card',  label: 'Card',  Icon: CreditCardIcon },
  { id: 'upi',   label: 'UPI',   Icon: BuildingLibraryIcon },
];

export default function Billing() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const receiptRef = useRef(null);

  // ── State ──
  const [paymentMode, setPaymentMode]       = useState('cash');
  const [discountValue, setDiscountValue]   = useState('');
  const [amountPaid, setAmountPaid]         = useState('');
  
  // Customer Info
  const [customerName, setCustomerName]     = useState('');
  const [customerPhone, setCustomerPhone]   = useState('');
  const [customerEmail, setCustomerEmail]   = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const [status, setStatus]                 = useState('idle'); // idle | processing | success
  const [receipt, setReceipt]               = useState(null);

  // Customer Selection State
  const [customers, setCustomers]           = useState([]);
  const [searchTerm, setSearchTerm]         = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // ── Fetch Customers ──
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axiosClient.get('/customers/');
        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email || '');
    setCustomerAddress(customer.address || '');
    setShowCustomerList(false);
    setSearchTerm('');
  };

  const handleClearCustomer = () => {
    setSelectedCustomerId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
  };

  // ── Calculations ──
  const subtotal = Math.round(cart.reduce((acc, item) => acc + item.price * item.qty, 0));
  const discountAmt = Math.round(parseFloat(discountValue) || 0);
  const afterDiscount = Math.max(0, subtotal - discountAmt);
  const gstAmt = Math.round(afterDiscount * 0.18);
  const total = Math.round(afterDiscount + gstAmt);

  const paid = parseFloat(amountPaid) || 0;
  const change = Math.round(Math.max(0, paid - total));

  // ── Complete Sale ──
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    if (paid < total) {
      alert(`Insufficient amount. Total is ₹${total}`);
      return;
    }
    
    setStatus('processing');
    try {
      const payload = {
        subtotal: subtotal,
        gst_amount: gstAmt,
        total: total,
        payment_mode: paymentMode,
        status: 'paid',
        customer_id: selectedCustomerId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.qty,
          unit_price: Math.round(item.price),
          total_price: Math.round(item.price * item.qty),
        })),
      };
      const res = await axiosClient.post('/invoices/', payload);
      
      // Artificial delay of 3 seconds to show processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setReceipt({
        invoiceNumber: res.data.invoice_number,
        date: new Date().toLocaleString('en-IN'),
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        items: [...cart],
        subtotal,
        discountAmt,
        gstAmt,
        total,
        paymentMode,
        amountPaid: paid || total,
        change: change
      });

      setStatus('success');
      console.log('Order created successfully:', res.data.invoice_number);
      
      setTimeout(() => {
        clearCart();
        setDiscountValue('');
        setAmountPaid('');
      }, 300);
    } catch (err) {
      console.error('Sale Completion Error:', err);
      setStatus('idle');
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      alert('Order Failed: ' + msg);
    }
  };

  const handlePrint = () => {
    const content = receiptRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(`<html><head><style>body{font-family:sans-serif;padding:20px; font-size:12px;} .row{display:flex;justify-content:space-between;margin:5px 0;} hr{border:0;border-top:1px dashed #ccc;} .bold{font-weight:bold;}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      clearCart();
      setDiscountValue('');
      setAmountPaid('');
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  return (
    <div className="h-full bg-[#F3F4F6] -m-6 p-6 overflow-auto custom-scrollbar">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* ── CENTER COLUMN: ORDER SUMMARY & PRODUCTS ── */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-[#111827]">New Sales Order</h1>
              <p className="text-xs text-slate-500 mt-0.5">Order ID: #ORD-{Date.now().toString().slice(-6)}</p>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={handleCancelOrder}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
               >
                 <XCircleIcon className="w-4 h-4"/> Cancel Order
               </button>
               <button 
                onClick={handleCompleteSale} 
                disabled={cart.length === 0} 
                className="flex items-center gap-2 px-6 py-2 bg-[#111827] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50"
               >
                 <CheckCircleIcon className="w-4 h-4"/> Proceed to Pay
               </button>
            </div>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-[#111827] flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-teal-500" /> Items in Cart
              </h2>
              <span className="bg-white px-2 py-1 rounded-md border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                {cart.length} Total Units
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {cart.length === 0 ? (
                <div className="p-20 text-center text-slate-400">
                   <p className="font-medium italic">Cart is empty. Please add items to proceed.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-5 flex items-center gap-4 hover:bg-slate-50/30 transition-colors">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200/50">
                      <img src={item.image_url || 'https://via.placeholder.com/64'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#111827] truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all"><MinusIcon className="w-4 h-4"/></button>
                        <span className="w-6 text-center font-black text-sm text-[#111827]">{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all"><PlusIcon className="w-4 h-4"/></button>
                      </div>
                      <div className="text-right w-28">
                        <p className="text-[10px] text-slate-400 font-medium">₹{item.price.toLocaleString()}/ea</p>
                        <p className="font-black text-[#111827] text-base">₹{(item.price * item.qty).toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-[9px] text-red-400 font-black uppercase tracking-tighter hover:text-red-600">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-[#111827] mb-6 flex items-center gap-2">
              <CalculatorIcon className="w-5 h-5 text-teal-500" /> Order Summary & Discount
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-[#111827]">₹{subtotal.toLocaleString()}</span>
                </div>
                
                {/* Discount Input */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Add Discount (₹)</span>
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-24 text-right bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-green-600 focus:border-green-500 outline-none"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                  />
                </div>

                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>GST (18%)</span>
                  <span className="text-[#111827]">₹{gstAmt.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-base font-black text-[#111827] uppercase tracking-tighter">Grand Total</span>
                  <span className="text-3xl font-black text-[#111827]">₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Choose Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                        {PAYMENT_METHODS.map(m => (
                          <button 
                            key={m.id}
                            onClick={() => { setPaymentMode(m.id); setAmountPaid(total.toString()); }}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                              paymentMode === m.id ? "border-[#111827] bg-slate-50 shadow-sm" : "border-slate-50 hover:border-slate-200 text-slate-400"
                            )}
                          >
                            <m.Icon className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                          </button>
                        ))}
                    </div>
                 </div>

                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                         {paymentMode === 'cash' ? 'Cash Received' : `${paymentMode.toUpperCase()} Amount Received`}
                       </label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">₹</span>
                          <input 
                            type="number" 
                            className="w-full bg-[#111827] text-white rounded-2xl py-4 pl-10 pr-4 text-2xl font-black outline-none placeholder:text-slate-600"
                            placeholder={total.toString()}
                            value={amountPaid}
                            onChange={e => setAmountPaid(e.target.value)}
                          />
                       </div>
                    </div>

                    {(paymentMode === 'card' || paymentMode === 'upi') && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Transaction Reference (Optional)</label>
                        <input 
                          type="text"
                          placeholder="TXN ID / Ref No."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#111827]"
                        />
                      </div>
                    )}

                    {paymentMode === 'cash' && paid >= total && (
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                         <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Change to Return</span>
                         <span className="text-lg font-black text-green-600">₹{change}</span>
                      </div>
                    )}
                 </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: CUSTOMER INFORMATION ── */}
        <div className="xl:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-7">
            <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-[#111827]">Customer Info</h3>
               {selectedCustomerId ? (
                 <button 
                  onClick={handleClearCustomer}
                  className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                 >
                   Clear Selection
                 </button>
               ) : (
                 <UserIcon className="w-5 h-5 text-slate-200" />
               )}
            </div>
            
            <div className="space-y-5">
               {/* Search / Select Customer */}
               {!selectedCustomerId && (
                 <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Existing Customer</label>
                    <div className="relative mt-2">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Search by name or phone..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-slate-300 transition-all"
                        value={searchTerm}
                        onChange={e => {
                          setSearchTerm(e.target.value);
                          setShowCustomerList(true);
                        }}
                        onFocus={() => setShowCustomerList(true)}
                      />
                    </div>

                    <AnimatePresence>
                      {showCustomerList && searchTerm.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-auto custom-scrollbar"
                        >
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                              <button
                                key={customer.id}
                                onClick={() => handleSelectCustomer(customer)}
                                className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center justify-between group border-b border-slate-50 last:border-0"
                              >
                                <div>
                                  <p className="font-bold text-[#111827] group-hover:text-teal-600 transition-colors">{customer.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{customer.phone}</p>
                                </div>
                                <ChevronRightIcon className="w-4 h-4 text-slate-200 group-hover:text-teal-400" />
                              </button>
                            ))
                          ) : (
                            <div className="px-5 py-4 text-center">
                              <p className="text-xs text-slate-400">No customers found</p>
                              <button 
                                onClick={() => setShowCustomerList(false)}
                                className="mt-2 text-[10px] font-black text-teal-500 uppercase tracking-widest"
                              >
                                + Create New Instead
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               )}

               {selectedCustomerId && (
                 <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <UserGroupIcon className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Selected Customer</p>
                      <p className="font-bold text-[#111827]">{customerName}</p>
                    </div>
                 </div>
               )}

               {/* Name */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="e.g. Vaibhav"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-slate-300 transition-all"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                    />
                  </div>
               </div>

               {/* Phone */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="tel" 
                      placeholder="+91 00000 00000"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-slate-300 transition-all"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                    />
                  </div>
               </div>

               {/* Email */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Optional)</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="email" 
                      placeholder="customer@email.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-slate-300 transition-all"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                    />
                  </div>
               </div>

               {/* Address */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shipping Address</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                    <textarea 
                      placeholder="Enter full address..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-slate-300 transition-all min-h-[100px] resize-none"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                    />
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <div className="p-4 bg-[#111827]/5 rounded-2xl border border-[#111827]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <CheckCircleIcon className="w-5 h-5 text-teal-600" />
                     <span className="text-xs font-bold text-slate-600">Loyalty points available</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-slate-300" />
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── SUCCESS OVERLAY ── */}
      <AnimatePresence>
        {status === 'success' && receipt && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111827]/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.2 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="p-10 text-center bg-gradient-to-br from-slate-900 to-[#111827] text-white">
                 <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/30">
                    <CheckCircleIcon className="w-12 h-12 text-white" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight">Payment Done</h2>
                 <p className="text-slate-400 mt-2 text-sm">Order #{receipt.invoiceNumber} processed successfully.</p>
              </div>
              
              <div ref={receiptRef} className="p-8 font-mono text-[11px] text-slate-800">
                 <div style={{textAlign:'center', marginBottom:20}}>
                    <h3 style={{margin:0, fontSize:16, fontWeight:'black'}}>SHOP MANAGER PRO</h3>
                    <p style={{margin:2}}>Tax Invoice: {receipt.invoiceNumber}</p>
                    <p style={{margin:0, opacity:0.6}}>{receipt.date}</p>
                 </div>
                 <hr style={{border:0, borderTop:'1px dashed #ccc', margin:'15px 0'}}/>
                 <div style={{marginBottom:15}}>
                    <p style={{margin:0}}><b>Customer:</b> {receipt.customerName}</p>
                    {receipt.customerPhone && <p style={{margin:0}}><b>Phone:</b> {receipt.customerPhone}</p>}
                 </div>
                 {receipt.items.map(item => (
                   <div key={item.id} className="row" style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                      <span>{item.name} (x{item.qty})</span>
                      <span className="bold">₹{(item.price * item.qty).toLocaleString()}</span>
                   </div>
                 ))}
                 <hr style={{border:0, borderTop:'1px dashed #ccc', margin:'15px 0'}}/>
                 <div className="row" style={{display:'flex', justifyContent:'space-between'}}><span>Subtotal</span><span>₹{receipt.subtotal.toLocaleString()}</span></div>
                 {receipt.discountAmt > 0 && <div className="row" style={{display:'flex', justifyContent:'space-between', color:'green'}}><span>Discount</span><span>-₹{receipt.discountAmt.toLocaleString()}</span></div>}
                 <div className="row" style={{display:'flex', justifyContent:'space-between'}}><span>GST (18%)</span><span>₹{receipt.gstAmt.toLocaleString()}</span></div>
                 <div className="row" style={{display:'flex', justifyContent:'space-between', fontWeight:'black', fontSize:16, marginTop:10, borderTop:'1px solid #000', paddingTop:10}}>
                    <span>TOTAL</span>
                    <span>₹{receipt.total.toLocaleString()}</span>
                 </div>
                 <div className="row" style={{display:'flex', justifyContent:'space-between', marginTop:5, fontSize:10, opacity:0.6}}>
                    <span>Paid via {receipt.paymentMode.toUpperCase()}</span>
                    {receipt.paymentMode === 'cash' && <span>Change: ₹{receipt.change.toFixed(2)}</span>}
                 </div>
              </div>

              <div className="p-6 bg-slate-50 flex gap-3">
                 <button onClick={() => setStatus('idle')} className="flex-1 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest">Close</button>
                 <button onClick={handlePrint} className="flex-1 px-4 py-4 bg-[#111827] text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors uppercase tracking-widest shadow-xl shadow-slate-900/20">
                    <PrinterIcon className="w-4 h-4"/> Print Receipt
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PROCESSING OVERLAY ── */}
      {status === 'processing' && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-8 border-[#111827] border-t-teal-500 rounded-full animate-spin"></div>
              <p className="font-black text-[#111827] uppercase tracking-[0.3em] text-sm animate-pulse">Processing Payment...</p>
           </div>
        </div>
      )}

    </div>
  );
}
