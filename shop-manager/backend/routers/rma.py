from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.RepairTicketResponse])
def get_repair_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.RepairTicket).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.RepairTicketResponse)
def create_repair_ticket(ticket: schemas.RepairTicketCreate, db: Session = Depends(database.get_db)):
    # Generate unique ticket number
    ticket_number = f"RMA-{db.query(models.RepairTicket).count() + 1000}"
    db_ticket = models.RepairTicket(**ticket.model_dump(), ticket_number=ticket_number)
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.put("/{ticket_id}/status", response_model=schemas.RepairTicketResponse)
def update_ticket_status(ticket_id: int, status: str, db: Session = Depends(database.get_db)):
    db_ticket = db.query(models.RepairTicket).filter(models.RepairTicket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db_ticket.status = status
    db.commit()
    db.refresh(db_ticket)
    return db_ticket
