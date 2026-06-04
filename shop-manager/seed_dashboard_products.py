from backend.database import SessionLocal
from backend import models

def seed_products():
    db = SessionLocal()
    try:
        products = [
            {"name": "iPhone 15 Pro", "category": "Mobile", "price": 134900, "sku": "IP15P-256", "brand": "Apple"},
            {"name": "Galaxy S24 Ultra", "category": "Mobile", "price": 129999, "sku": "S24U-512", "brand": "Samsung"},
            {"name": "MacBook Air M3", "category": "Computing", "price": 114900, "sku": "MBA-M3-13", "brand": "Apple"},
            {"name": "Dell XPS 15", "category": "Computing", "price": 185000, "sku": "XPS15-9530", "brand": "Dell"},
            {"name": "Samsung QLED TV", "category": "Electronics", "price": 85000, "sku": "QLED-55", "brand": "Samsung"},
            {"name": "Legion Pro Max", "category": "Laptop", "price": 145000, "sku": "LPM-900", "brand": "Lenovo"},
            {"name": "X-Phone Ultra", "category": "Smartphone", "price": 112000, "sku": "XPU-882", "brand": "X-Brand"},
            {"name": "Chronos Watch V2", "category": "Smartwatch", "price": 34500, "sku": "CW-20", "brand": "Chronos"},
            {"name": "Aura Sound Pro", "category": "Headphones", "price": 28999, "sku": "ASP-01", "brand": "Aura"},
            {"name": "Alpha Cam Z9", "category": "Camera", "price": 320000, "sku": "AC-Z9", "brand": "Alpha"},
            {"name": "Tab Master X", "category": "Tablet", "price": 85000, "sku": "TMX-99", "brand": "TabMaster"},
            {"name": "Aero Drone 4K", "category": "Drone", "price": 155000, "sku": "AD-4K", "brand": "Aero"},
            {"name": "Vision VR Pro", "category": "VR Headset", "price": 72000, "sku": "VR-200", "brand": "Vision"},
            {"name": "Nexus Station", "category": "Gaming Console", "price": 55000, "sku": "NXS-1", "brand": "Nexus"},
            {"name": "Echo Base 360", "category": "Smart Speaker", "price": 18500, "sku": "EB-360", "brand": "Echo"},
        ]

        for p_data in products:
            # Check if SKU exists
            exists = db.query(models.Product).filter(models.Product.sku == p_data["sku"]).first()
            if not exists:
                new_p = models.Product(
                    name=p_data["name"],
                    brand=p_data["brand"],
                    sku=p_data["sku"],
                    category=p_data["category"],
                    price=p_data["price"],
                    cost_price=p_data["price"] * 0.8, # Estimated cost price
                    stock_qty=20, # Initial stock
                    min_stock=5
                )
                db.add(new_p)
        
        db.commit()
        print("Successfully seeded dashboard products into Inventory Master.")
    except Exception as e:
        print(f"Error seeding products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
