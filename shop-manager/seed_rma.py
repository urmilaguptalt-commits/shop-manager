from backend.database import SessionLocal
from backend import models
from datetime import datetime

def seed_rma():
    db = SessionLocal()
    try:
        # Get some existing data
        customer = db.query(models.Customer).first()
        unit = db.query(models.ProductUnit).first()
        
        if not customer or not unit:
            print("Need customers and product units to seed RMA. Please seed them first.")
            return

        tickets = [
            {
                "ticket_number": "RMA-1002",
                "customer_id": customer.id,
                "product_unit_id": unit.id,
                "complaint": "Screen flickering",
                "status": "received"
            },
            {
                "ticket_number": "RMA-1001",
                "customer_id": customer.id,
                "product_unit_id": unit.id,
                "complaint": "Battery won't charge",
                "status": "vendor"
            }
        ]
        
        for t in tickets:
            exists = db.query(models.RepairTicket).filter(models.RepairTicket.ticket_number == t["ticket_number"]).first()
            if not exists:
                new_t = models.RepairTicket(**t)
                db.add(new_t)
        
        db.commit()
        print("RMA tickets seeded.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_rma()
