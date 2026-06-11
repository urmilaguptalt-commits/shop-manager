import json
import os

json_path = os.path.join('frontend', 'public', 'data.json')
api_path = os.path.join('frontend', 'netlify', 'functions', 'api.js')

if not os.path.exists(json_path):
    print(f"Error: {json_path} not found.")
    exit(1)

# Load updated JSON data
with open(json_path, 'r', encoding='utf-8') as f:
    db_data = json.load(f)

# Define the serverless function template
api_template = """const db = DATABASE_PLACEHOLDER;

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
  // e.g. /.netlify/functions/api/products -> /products
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
        const units = db.product_units.map(u => ({
          ...u,
          product: db.products.find(p => p.id === u.product_id)
        }));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(units)
        };
      }
      
      // GET /products/
      if (parts.length === 1 && method === 'GET') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(db.products)
        };
      }

      // POST /products/
      if (parts.length === 1 && method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const newProduct = {
          id: db.products.length ? Math.max(...db.products.map(p => p.id)) + 1 : 1,
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
        };
        db.products.push(newProduct);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(newProduct)
        };
      }

      // PUT /products/:id
      if (parts.length === 2 && method === 'PUT') {
        const productId = parseInt(parts[1]);
        const body = JSON.parse(event.body || '{}');
        const productIndex = db.products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ detail: "Product not found" })
          };
        }
        
        db.products[productIndex] = {
          ...db.products[productIndex],
          name: body.name !== undefined ? body.name : db.products[productIndex].name,
          brand: body.brand !== undefined ? body.brand : db.products[productIndex].brand,
          sku: body.sku !== undefined ? body.sku : db.products[productIndex].sku,
          category: body.category !== undefined ? body.category : db.products[productIndex].category,
          price: body.price !== undefined ? parseFloat(body.price) : db.products[productIndex].price,
          cost_price: body.cost_price !== undefined ? parseFloat(body.cost_price) : db.products[productIndex].cost_price,
          specs: body.specs !== undefined ? body.specs : db.products[productIndex].specs,
          stock_qty: body.stock_qty !== undefined ? parseInt(body.stock_qty) : db.products[productIndex].stock_qty,
          min_stock: body.min_stock !== undefined ? parseInt(body.min_stock) : db.products[productIndex].min_stock,
          image_url: body.image_url !== undefined ? body.image_url : db.products[productIndex].image_url,
          supplier_id: body.supplier_id !== undefined ? (body.supplier_id ? parseInt(body.supplier_id) : null) : db.products[productIndex].supplier_id
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(db.products[productIndex])
        };
      }

      // DELETE /products/:id
      if (parts.length === 2 && method === 'DELETE') {
        const productId = parseInt(parts[1]);
        const productIndex = db.products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ detail: "Product not found" })
          };
        }
        db.products.splice(productIndex, 1);
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
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(db.suppliers)
        };
      }

      // POST /suppliers/
      if (parts.length === 1 && method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const newSupplier = {
          id: db.suppliers.length ? Math.max(...db.suppliers.map(s => s.id)) + 1 : 1,
          name: body.name,
          contact_person: body.contact_person,
          phone: body.phone,
          email: body.email,
          category: body.category
        };
        db.suppliers.push(newSupplier);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(newSupplier)
        };
      }
    }

    // ----------------------------------------------------
    // PURCHASES (PO) ENDPOINTS
    // ----------------------------------------------------
    if (parts[0] === 'purchases') {
      // GET /purchases/
      if (parts.length === 1 && method === 'GET') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(db.purchase_orders)
        };
      }

      // POST /purchases/
      if (parts.length === 1 && method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const newPoId = db.purchase_orders.length ? Math.max(...db.purchase_orders.map(po => po.id)) + 1 : 1;
        const po_number = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${1000 + newPoId}`;
        
        const items = (body.items || []).map((item, idx) => {
          const prod = db.products.find(p => p.id === item.product_id);
          // Update stock qty for this product
          if (prod) {
            prod.stock_qty = (prod.stock_qty || 0) + parseInt(item.quantity);
          }
          return {
            id: idx + 1,
            po_id: newPoId,
            product_id: item.product_id,
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price),
            total_price: parseFloat(item.total_price || (item.quantity * item.unit_price)),
            product: prod
          };
        });

        const newPo = {
          id: newPoId,
          po_number,
          supplier_id: parseInt(body.supplier_id),
          date: new Date().toISOString(),
          status: "completed",
          total_amount: parseFloat(body.total_amount || items.reduce((acc, item) => acc + item.total_price, 0)),
          expected_delivery: body.expected_delivery || null,
          supplier: db.suppliers.find(s => s.id === parseInt(body.supplier_id)),
          items
        };
        db.purchase_orders.unshift(newPo);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(newPo)
        };
      }
    }

    // ----------------------------------------------------
    // CUSTOMERS ENDPOINTS
    // ----------------------------------------------------
    if (parts[0] === 'customers') {
      // GET /customers/
      if (parts.length === 1 && method === 'GET') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(db.customers)
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
        const customerInvoices = db.invoices.filter(inv => inv.customer_id === customerId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(customerInvoices)
        };
      }

      // GET /invoices/
      if (parts.length === 1 && method === 'GET') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(db.invoices)
        };
      }

      // POST /invoices/
      if (parts.length === 1 && method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const newInvoiceId = db.invoices.length ? Math.max(...db.invoices.map(inv => inv.id)) + 1 : 1;
        const invoice_number = `INV-${Date.now()}`;
        
        const items = (body.items || []).map((item, idx) => {
          const prod = db.products.find(p => p.id === item.product_id);
          // Deduct stock qty
          if (prod) {
            prod.stock_qty = Math.max(0, (prod.stock_qty || 0) - parseInt(item.quantity));
          }
          return {
            id: idx + 1,
            invoice_id: newInvoiceId,
            product_id: item.product_id,
            product_unit_id: null,
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price),
            total_price: parseFloat(item.total_price || (item.quantity * item.unit_price)),
            product: prod
          };
        });

        // If customer exists, update total purchases
        if (body.customer_id) {
          const cust = db.customers.find(c => c.id === parseInt(body.customer_id));
          if (cust) {
            cust.total_purchases = (cust.total_purchases || 0) + parseFloat(body.total);
          }
        }

        const newInvoice = {
          id: newInvoiceId,
          invoice_number,
          customer_id: body.customer_id ? parseInt(body.customer_id) : null,
          date: new Date().toISOString(),
          subtotal: parseFloat(body.subtotal),
          gst_amount: parseFloat(body.gst_amount),
          total: parseFloat(body.total),
          status: body.status || "paid",
          payment_mode: body.payment_mode || "cash",
          customer: body.customer_id
            ? db.customers.find(c => c.id === parseInt(body.customer_id))
            : { name: body.customer_name, phone: body.customer_phone, email: body.customer_email, total_purchases: parseFloat(body.total) },
          items
        };
        db.invoices.unshift(newInvoice);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(newInvoice)
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
"""

# Convert DB data to JSON format string
db_str = json.dumps(db_data, indent=2, ensure_ascii=False)

# Inject database string
full_api_code = api_template.replace("DATABASE_PLACEHOLDER", db_str)

# Write to functions folder
os.makedirs(os.path.dirname(api_path), exist_ok=True)
with open(api_path, 'w', encoding='utf-8') as f:
    f.write(full_api_code)

print(f"Successfully rebuilt standalone API at {api_path} with updated product/vendor data!")
