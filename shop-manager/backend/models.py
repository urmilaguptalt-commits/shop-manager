from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="cashier") # owner, cashier, admin

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    brand = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    category = Column(String)
    price = Column(Float)
    cost_price = Column(Float)
    specs = Column(String, nullable=True) # JSON string for RAM/Storage/etc.
    stock_qty = Column(Integer, default=0)
    min_stock = Column(Integer, default=10)
    image_url = Column(String, nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))

    supplier = relationship("Supplier", back_populates="products")
    units = relationship("ProductUnit", back_populates="product")

class ProductUnit(Base):
    __tablename__ = "product_units"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    serial_imei = Column(String, unique=True, index=True)
    status = Column(String, default="in-stock") # in-stock, sold, repairing
    warranty_expiry_date = Column(DateTime, nullable=True)
    
    product = relationship("Product", back_populates="units")
    repair_tickets = relationship("RepairTicket", back_populates="product_unit")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    total_purchases = Column(Float, default=0.0)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_person = Column(String)
    phone = Column(String)
    email = Column(String)
    category = Column(String)

    products = relationship("Product", back_populates="supplier")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    subtotal = Column(Float)
    gst_amount = Column(Float)
    total = Column(Float)
    status = Column(String, default="paid") # paid, pending
    payment_mode = Column(String) # cash, card, upi

    customer = relationship("Customer")
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    product_unit_id = Column(Integer, ForeignKey("product_units.id"), nullable=True) # Linked to specfic serial
    quantity = Column(Integer)
    unit_price = Column(Float)
    total_price = Column(Float)

    invoice = relationship("Invoice", back_populates="items")
    product = relationship("Product")
    product_unit = relationship("ProductUnit")

class RepairTicket(Base):
    __tablename__ = "repair_tickets"
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    product_unit_id = Column(Integer, ForeignKey("product_units.id"))
    complaint = Column(String)
    status = Column(String, default="Received") # Received, Sent to Vendor, In Repair, Resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer")
    product_unit = relationship("ProductUnit", back_populates="repair_tickets")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending") # pending, completed
    total_amount = Column(Float, default=0.0)
    expected_delivery = Column(DateTime, nullable=True)

    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="po")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    unit_price = Column(Float)
    total_price = Column(Float)

    po = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")
