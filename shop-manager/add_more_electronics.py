from backend.database import SessionLocal
from backend import models

def add_more_products():
    db = SessionLocal()
    try:
        # 1. Update iPhone photo to a more 'premium' one
        iphone = db.query(models.Product).filter(models.Product.name.like('%iPhone 15 Pro%')).first()
        if iphone:
            # High-end close up of iPhone 15 Pro titanium
            iphone.image_url = 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1200&auto=format&fit=crop'
        
        # 2. Add new electronic devices
        new_items = [
            {
                "name": "PlayStation 5 Slim",
                "brand": "Sony",
                "sku": "PS5-SLIM-1TB",
                "category": "Gaming",
                "price": 44990,
                "cost_price": 38000,
                "image_url": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop",
                "stock_qty": 15
            },
            {
                "name": "Sony WH-1000XM5",
                "brand": "Sony",
                "sku": "WH-XM5-BLK",
                "category": "Accessories",
                "price": 29990,
                "cost_price": 24000,
                "image_url": "https://images.unsplash.com/photo-1618366712010-8c0e2e20601d?q=80&w=800&auto=format&fit=crop",
                "stock_qty": 25
            },
            {
                "name": "iPad Pro M4",
                "brand": "Apple",
                "sku": "IPAD-M4-11",
                "category": "Tablet",
                "price": 99900,
                "cost_price": 85000,
                "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
                "stock_qty": 12
            },
            {
                "name": "Nintendo Switch OLED",
                "brand": "Nintendo",
                "sku": "SW-OLED-WHT",
                "category": "Gaming",
                "price": 32500,
                "cost_price": 28000,
                "image_url": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=800&auto=format&fit=crop",
                "stock_qty": 10
            }
        ]
        
        for item in new_items:
            exists = db.query(models.Product).filter(models.Product.sku == item["sku"]).first()
            if not exists:
                new_p = models.Product(
                    name=item["name"],
                    brand=item["brand"],
                    sku=item["sku"],
                    category=item["category"],
                    price=item["price"],
                    cost_price=item["cost_price"],
                    image_url=item["image_url"],
                    stock_qty=item["stock_qty"]
                )
                db.add(new_p)
        
        db.commit()
        print("iPhone photo updated and new products added.")
    finally:
        db.close()

if __name__ == "__main__":
    add_more_products()
