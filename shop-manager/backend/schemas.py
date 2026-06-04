from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# USER SCHEMAS
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "cashier"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# PRODUCT SCHEMAS
class ProductBase(BaseModel):
    name: str
    brand: str
    sku: str
    category: str
    price: float
    cost_price: float
    specs: Optional[str] = None
    stock_qty: int = 0
    min_stock: int = 10
    image_url: Optional[str] = None
    supplier_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

# PRODUCT UNIT SCHEMAS
class ProductUnitBase(BaseModel):
    product_id: int
    serial_imei: str
    status: str = "in-stock"
    warranty_expiry_date: Optional[datetime] = None

class ProductUnitCreate(ProductUnitBase):
    pass

class ProductUnitResponse(ProductUnitBase):
    id: int
    product: Optional[ProductResponse] = None
    class Config:
        from_attributes = True

# CUSTOMER SCHEMAS
class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    total_purchases: float
    class Config:
        from_attributes = True

# SUPPLIER SCHEMAS
class SupplierBase(BaseModel):
    name: str
    contact_person: str
    phone: str
    email: str
    category: str

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int
    class Config:
        from_attributes = True

# INVOICE SCHEMAS
class InvoiceItemBase(BaseModel):
    product_id: int
    product_unit_id: Optional[int] = None
    quantity: int
    unit_price: float
    total_price: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int
    product: Optional[ProductResponse] = None
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    customer_id: Optional[int] = None
    subtotal: float
    gst_amount: float
    total: float
    status: str = "paid"
    payment_mode: str

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: int
    invoice_number: str
    date: datetime
    items: List[InvoiceItemResponse] = []
    customer: Optional[CustomerResponse] = None
    class Config:
        from_attributes = True

# RMA (REPAIR TICKET) SCHEMAS
class RepairTicketBase(BaseModel):
    customer_id: int
    product_unit_id: int
    complaint: str
    status: str = "Received"

class RepairTicketCreate(RepairTicketBase):
    pass

class RepairTicketResponse(RepairTicketBase):
    id: int
    ticket_number: str
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None
    product_unit: Optional[ProductUnitResponse] = None
    class Config:
        from_attributes = True

# PURCHASE ORDER SCHEMAS
class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    total_price: float

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItemResponse(PurchaseOrderItemBase):
    id: int
    po_id: int
    product: Optional[ProductResponse] = None
    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    supplier_id: int
    status: str = "pending"
    total_amount: float
    expected_delivery: Optional[datetime] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderResponse(PurchaseOrderBase):
    id: int
    po_number: str
    date: datetime
    supplier: Optional[SupplierResponse] = None
    items: List[PurchaseOrderItemResponse] = []
    class Config:
        from_attributes = True
