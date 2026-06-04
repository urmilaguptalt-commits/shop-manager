from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import List
from .. import database, models, schemas, security

router = APIRouter()

@router.get("/dashboard-summary", dependencies=[Depends(security.get_current_user)])
def get_dashboard_summary(db: Session = Depends(database.get_db)):
    today = date.today()
    invoices_today = db.query(models.Invoice).filter(func.date(models.Invoice.date) == today).all()
    
    revenue_today = sum(inv.total for inv in invoices_today)
    bills_today = len(invoices_today)

    low_stock_items = db.query(models.Product).filter(models.Product.stock_qty <= models.Product.min_stock).all()
    
    return {
        "revenue_today": revenue_today,
        "bills_today": bills_today,
        "low_stock_count": len(low_stock_items),
        "low_stock_items": [
            {"id": p.id, "name": p.name, "stock": p.stock_qty, "min": p.min_stock} for p in low_stock_items
        ]
    }
