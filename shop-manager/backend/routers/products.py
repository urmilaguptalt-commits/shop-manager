from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, security

router = APIRouter()

@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Product).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.ProductResponse, dependencies=[Depends(security.require_role(["owner", "admin"]))])
def create_product(product: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=schemas.ProductResponse, dependencies=[Depends(security.require_role(["owner", "admin"]))])
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/units", response_model=List[schemas.ProductUnitResponse])
def get_product_units(db: Session = Depends(database.get_db)):
    return db.query(models.ProductUnit).all()

@router.delete("/{product_id}", dependencies=[Depends(security.require_role(["owner"]))])
def delete_product(product_id: int, db: Session = Depends(database.get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}
