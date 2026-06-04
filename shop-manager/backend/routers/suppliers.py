from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, security

router = APIRouter()

@router.get("/", response_model=List[schemas.SupplierResponse])
def get_suppliers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    return db.query(models.Supplier).order_by(models.Supplier.id.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.SupplierResponse)
def create_supplier(
    supplier: schemas.SupplierCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Check for duplicate phone
    existing = db.query(models.Supplier).filter(models.Supplier.phone == supplier.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Supplier with phone '{supplier.phone}' already exists.")
    
    db_supplier = models.Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier
