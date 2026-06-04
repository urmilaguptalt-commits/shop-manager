from backend.database import SessionLocal
from backend import models

def remove_photos():
    db = SessionLocal()
    try:
        # Get all products ordered by ID (consistent with the list shown earlier)
        products = db.query(models.Product).order_by(models.Product.id).all()
        
        # 15th product (index 14)
        if len(products) >= 15:
            p15 = products[14]
            p15.image_url = None # Or a generic placeholder
            print(f"Removed photo for 15: {p15.name}")
            
        # 18th product (index 17)
        if len(products) >= 18:
            p18 = products[17]
            p18.image_url = None
            print(f"Removed photo for 18: {p18.name}")
            
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    remove_photos()
