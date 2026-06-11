const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client with environment variables (falling back to user credentials)
const supabaseUrl = process.env.SUPABASE_URL || 'https://efrpjjxidpkdichzxsdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_hBp-8hX26lFPURD_zlk8jw_wrsT9pej';

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const method = event.httpMethod;
  let path = event.path;
  
  // Headers for CORS and JSON response
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS requests
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // Parse path to match routers
  if (path.startsWith('/.netlify/functions/api')) {
    path = path.substring('/.netlify/functions/api'.length);
  } else if (path.startsWith('/api')) {
    path = path.substring('/api'.length);
  }

  const cleanPath = path.replace(/^\/|\/$/g, '');
  const parts = cleanPath ? cleanPath.split('/') : [];

  try {
    // ----------------------------------------------------
    // PRODUCTS ENDPOINTS
    // ----------------------------------------------------
    if (parts[0] === 'products') {
      // GET /products/units
      if (parts[1] === 'units' && method === 'GET') {
        const { data, error } = await supabase
          .from('product_units')
          .select('*, product:products(*)')
          .order('id', { ascending: true });
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }
      
      // GET /products/
      if (parts.length === 1 && method === 'GET') {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // POST /products/
      if (parts.length === 1 && method === 'POST') {
        const body = JSON.parse(event.body || '{}');
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
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // PUT /products/:id
      if (parts.length === 2 && method === 'PUT') {
        const productId = parseInt(parts[1]);
        const body = JSON.parse(event.body || '{}');
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
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // DELETE /products/:id
      if (parts.length === 2 && method === 'DELETE') {
        const productId = parseInt(parts[1]);
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "Product deleted successfully" })
        };
      }
    }

    // ----------------------------------------------------
    // SUPPLIERS ENDPOINTS
    // ----------------------------------------------------
    if (parts[0] === 'suppliers') {
      // GET /suppliers/
      if (parts.length === 1 && method === 'GET') {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // POST /suppliers/
      if (parts.length === 1 && method === 'POST') {
        const body = JSON.parse(event.body || '{}');
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
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }
    }

    // ----------------------------------------------------
    // PURCHASES (PO) ENDPOINTS
    // ----------------------------------------------------
    if (parts[0] === 'purchases') {
      // GET /purchases/
      if (parts.length === 1 && method === 'GET') {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select('*, supplier:suppliers(*), items:purchase_order_items(*, product:products(*))')
          .order('date', { ascending: false });
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // POST /purchases/
      if (parts.length === 1 && method === 'POST') {
        const body = JSON.parse(event.body || '{}');
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

          // Update stock qty for this product
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

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(populatedPo)
        };
      }
    }

    // ----------------------------------------------------
    // CUSTOMERS ENDPOINTS
    // ----------------------------------------------------
    if (parts[0] === 'customers') {
      // GET /customers/
      if (parts.length === 1 && method === 'GET') {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }
    }

    // ----------------------------------------------------
    // INVOICES ENDPOINTS
    // ----------------------------------------------------
    if (parts[0] === 'invoices') {
      // GET /invoices/customer/:id
      if (parts[1] === 'customer' && parts.length === 3 && method === 'GET') {
        const customerId = parseInt(parts[2]);
        const { data, error } = await supabase
          .from('invoices')
          .select('*, customer:customers(*), items:invoice_items(*, product:products(*))')
          .eq('customer_id', customerId)
          .order('date', { ascending: false });
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // GET /invoices/
      if (parts.length === 1 && method === 'GET') {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, customer:customers(*), items:invoice_items(*, product:products(*))')
          .order('date', { ascending: false });
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // POST /invoices/
      if (parts.length === 1 && method === 'POST') {
        const body = JSON.parse(event.body || '{}');
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

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(populatedInv)
        };
      }
    }

    // ----------------------------------------------------
    // AUTH ENDPOINTS
    // ----------------------------------------------------
    if (parts[0] === 'auth' && parts[1] === 'login' && method === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          access_token: "mock-jwt-token-for-netlify-deployment",
          token_type: "bearer"
        })
      };
    }

    // Default 404 for unknown endpoints
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ detail: `Endpoint ${method} ${path} not found` })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ detail: error.message })
    };
  }
};
