const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://efrpjjxidpkdichzxsdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_hBp-8hX26lFPURD_zlk8jw_wrsT9pej';
const supabase = createClient(supabaseUrl, supabaseKey);

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Shop Management Node/Express API connected to Supabase!" });
});

// ----------------------------------------------------
// PRODUCTS ENDPOINTS
// ----------------------------------------------------

// GET /api/products/units
app.get('/api/products/units', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_units')
      .select('*, product:products(*)')
      .order('id', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/products
app.post('/api/products', async (req, res) => {
  try {
    const body = req.body;
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: body.name,
          brand: body.brand,
          sku: body.sku,
          category: body.category,
          price: parseFloat(body.price),
          cost_price: parseFloat(body.cost_price),
          specs: body.specs || null,
          stock_qty: parseInt(body.stock_qty || 0),
          min_stock: parseInt(body.min_stock || 10),
          image_url: body.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
          supplier_id: body.supplier_id ? parseInt(body.supplier_id) : null
        }
      ])
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const body = req.body;
    const { data, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        brand: body.brand,
        sku: body.sku,
        category: body.category,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        cost_price: body.cost_price !== undefined ? parseFloat(body.cost_price) : undefined,
        specs: body.specs,
        stock_qty: body.stock_qty !== undefined ? parseInt(body.stock_qty) : undefined,
        min_stock: body.min_stock !== undefined ? parseInt(body.min_stock) : undefined,
        image_url: body.image_url,
        supplier_id: body.supplier_id !== undefined ? (body.supplier_id ? parseInt(body.supplier_id) : null) : undefined
      })
      .eq('id', productId)
      .select('*')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ----------------------------------------------------
// SUPPLIERS ENDPOINTS
// ----------------------------------------------------

// GET /api/suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/suppliers
app.post('/api/suppliers', async (req, res) => {
  try {
    const body = req.body;
    const { data, error } = await supabase
      .from('suppliers')
      .insert([
        {
          name: body.name,
          contact_person: body.contact_person,
          phone: body.phone,
          email: body.email,
          category: body.category
        }
      ])
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ----------------------------------------------------
// PURCHASES (PO) ENDPOINTS
// ----------------------------------------------------

// GET /api/purchases
app.get('/api/purchases', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, supplier:suppliers(*), items:purchase_order_items(*, product:products(*))')
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/purchases
app.post('/api/purchases', async (req, res) => {
  try {
    const body = req.body;
    const po_number = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // 1. Insert Purchase Order
    const { data: newPo, error: poError } = await supabase
      .from('purchase_orders')
      .insert([
        {
          po_number,
          supplier_id: parseInt(body.supplier_id),
          date: new Date().toISOString(),
          status: "completed",
          total_amount: parseFloat(body.total_amount),
          expected_delivery: body.expected_delivery || null
        }
      ])
      .select('*')
      .single();
    if (poError) throw poError;

    // 2. Insert Items & Update stock
    const itemsToInsert = [];
    for (const item of (body.items || [])) {
      itemsToInsert.push({
        po_id: newPo.id,
        product_id: item.product_id,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price)
      });

      // Update stock
      const { data: prod } = await supabase.from('products').select('stock_qty').eq('id', item.product_id).single();
      if (prod) {
        await supabase
          .from('products')
          .update({ stock_qty: (prod.stock_qty || 0) + parseInt(item.quantity) })
          .eq('id', item.product_id);
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    // 3. Fetch Populated PO
    const { data: populatedPo, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('*, supplier:suppliers(*), items:purchase_order_items(*, product:products(*))')
      .eq('id', newPo.id)
      .single();
    if (fetchError) throw fetchError;

    res.json(populatedPo);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ----------------------------------------------------
// CUSTOMERS ENDPOINTS
// ----------------------------------------------------

// GET /api/customers
app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ----------------------------------------------------
// INVOICES ENDPOINTS
// ----------------------------------------------------

// GET /api/invoices/customer/:id
app.get('/api/invoices/customer/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:customers(*), items:invoice_items(*, product:products(*))')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:customers(*), items:invoice_items(*, product:products(*))')
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/invoices
app.post('/api/invoices', async (req, res) => {
  try {
    const body = req.body;
    const invoice_number = `INV-${Date.now()}`;
    
    // 1. Insert Invoice
    const { data: newInv, error: invError } = await supabase
      .from('invoices')
      .insert([
        {
          invoice_number,
          customer_id: body.customer_id ? parseInt(body.customer_id) : null,
          date: new Date().toISOString(),
          subtotal: parseFloat(body.subtotal),
          gst_amount: parseFloat(body.gst_amount),
          total: parseFloat(body.total),
          status: body.status || "paid",
          payment_mode: body.payment_mode || "cash"
        }
      ])
      .select('*')
      .single();
    if (invError) throw invError;

    // 2. Insert items, deduct stock
    const itemsToInsert = [];
    for (const item of (body.items || [])) {
      itemsToInsert.push({
        invoice_id: newInv.id,
        product_id: item.product_id,
        product_unit_id: null,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price)
      });

      // Deduct stock
      const { data: prod } = await supabase.from('products').select('stock_qty').eq('id', item.product_id).single();
      if (prod) {
        await supabase
          .from('products')
          .update({ stock_qty: Math.max(0, (prod.stock_qty || 0) - parseInt(item.quantity)) })
          .eq('id', item.product_id);
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    // 3. Update customer loyalty purchases
    if (body.customer_id) {
      const { data: cust } = await supabase.from('customers').select('total_purchases').eq('id', body.customer_id).single();
      if (cust) {
        await supabase
          .from('customers')
          .update({ total_purchases: (cust.total_purchases || 0) + parseFloat(body.total) })
          .eq('id', body.customer_id);
      }
    }

    // 4. Fetch Populated Invoice
    const { data: populatedInv, error: fetchError } = await supabase
      .from('invoices')
      .select('*, customer:customers(*), items:invoice_items(*, product:products(*))')
      .eq('id', newInv.id)
      .single();
    if (fetchError) throw fetchError;

    res.json(populatedInv);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  res.json({
    access_token: "mock-jwt-token-for-netlify-deployment",
    token_type: "bearer"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running locally on http://localhost:${PORT}`);
});
