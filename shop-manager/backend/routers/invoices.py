from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import database, models, schemas, security

router = APIRouter()

@router.get("/", response_model=List[schemas.InvoiceResponse])
def get_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    from sqlalchemy.orm import joinedload
    return db.query(models.Invoice).options(joinedload(models.Invoice.items).joinedload(models.InvoiceItem.product)).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.InvoiceResponse)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    # 1. Handle Customer (Link existing or Create new)
    final_customer_id = invoice.customer_id
    if not final_customer_id and invoice.customer_phone:
        # Try to find by phone
        db_customer = db.query(models.Customer).filter(models.Customer.phone == invoice.customer_phone).first()
        if not db_customer and invoice.customer_name:
            # Create new customer
            db_customer = models.Customer(
                name=invoice.customer_name,
                phone=invoice.customer_phone,
                email=invoice.customer_email
            )
            db.add(db_customer)
            db.commit()
            db.refresh(db_customer)
        if db_customer:
            final_customer_id = db_customer.id
            # Update total purchases
            db_customer.total_purchases += invoice.total

    # 2. Create invoice record
    invoice_number = f"INV-{int(datetime.utcnow().timestamp())}"
    db_invoice = models.Invoice(
        invoice_number=invoice_number,
        customer_id=final_customer_id,
        subtotal=invoice.subtotal,
        gst_amount=invoice.gst_amount,
        total=invoice.total,
        status=invoice.status,
        payment_mode=invoice.payment_mode
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    # 3. Process items and deduct stock
    for item in invoice.items:
        db_item = models.InvoiceItem(
            invoice_id=db_invoice.id,
            product_id=item.product_id,
            product_unit_id=item.product_unit_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price
        )
        db.add(db_item)
        
        # Deduct stock
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.stock_qty -= item.quantity

    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/customer/{customer_id}", response_model=List[schemas.InvoiceResponse])
def get_customer_history(customer_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    from sqlalchemy.orm import joinedload
    return db.query(models.Invoice).options(joinedload(models.Invoice.items).joinedload(models.InvoiceItem.product)).filter(models.Invoice.customer_id == customer_id).all()
