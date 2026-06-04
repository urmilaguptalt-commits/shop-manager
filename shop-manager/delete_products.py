from backend.database import SessionLocal
from backend import models

def delete_products():
    db = SessionLocal()
    try:
        # Get all products ordered by ID to match the user's perceived order
        products = db.query(models.Product).order_by(models.Product.id).all()
        
        to_delete = []
        # 15th product (index 14)
        if len(products) >= 15:
            p15 = products[14]
            to_delete.append(p15)
            print(f"Deleting 15: {p15.name}")
            
        # 18th product (index 17)
        if len(products) >= 18:
            p18 = products[17]
            to_delete.append(p18)
            print(f"Deleting 18: {p18.name}")
            
        for p in to_delete:
            db.delete(p)
            
        db.commit()
        print("Products deleted successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_products()
