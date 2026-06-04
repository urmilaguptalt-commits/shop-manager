from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import database, models, schemas, security

router = APIRouter()

@router.get("/", response_model=List[schemas.PurchaseOrderResponse])
def get_purchase_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    return (
        db.query(models.PurchaseOrder)
        .options(
            joinedload(models.PurchaseOrder.supplier),
            joinedload(models.PurchaseOrder.items).joinedload(models.PurchaseOrderItem.product)
        )
        .order_by(models.PurchaseOrder.date.desc())
        .offset(skip).limit(limit).all()
    )

@router.post("/", response_model=schemas.PurchaseOrderResponse)
def create_purchase_order(
    po: schemas.PurchaseOrderCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Validate supplier exists
    supplier = db.query(models.Supplier).filter(models.Supplier.id == po.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    po_number = f"PO-{db.query(models.PurchaseOrder).count() + 1000}"
    db_po = models.PurchaseOrder(
        supplier_id=po.supplier_id,
        po_number=po_number,
        total_amount=po.total_amount,
        expected_delivery=po.expected_delivery,
        status="completed"
    )
    db.add(db_po)
    db.commit()
    db.refresh(db_po)

    for item in po.items:
        db_item = models.PurchaseOrderItem(**item.model_dump(), po_id=db_po.id)
        db.add(db_item)
        # Increase product stock
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.stock_qty += item.quantity

    db.commit()

    # Reload with all relationships for proper response
    db_po = (
        db.query(models.PurchaseOrder)
        .options(
            joinedload(models.PurchaseOrder.supplier),
            joinedload(models.PurchaseOrder.items).joinedload(models.PurchaseOrderItem.product)
        )
        .filter(models.PurchaseOrder.id == db_po.id)
        .first()
    )
    return db_po

