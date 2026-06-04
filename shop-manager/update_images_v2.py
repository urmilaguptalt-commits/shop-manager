from backend.database import SessionLocal
from backend import models

def update_all_images_accurately():
    db = SessionLocal()
    try:
        # Dictionary of product names to high-quality, accurate Unsplash images
        image_map = {
            "iPhone 15 Pro": "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop",
            "Galaxy S24 Ultra": "https://images.unsplash.com/photo-1707133990356-912b7941785e?q=80&w=800&auto=format&fit=crop",
            "MacBook Air M3": "https://images.unsplash.com/photo-1517336714460-4c50d117900b?q=80&w=800&auto=format&fit=crop",
            "Dell XPS 15": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&auto=format&fit=crop",
            "Samsung QLED 4K TV": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop",
            "Redmi Pad 2 Wi-Fi + Cellular": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
            "Legion Pro Max": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
            "PlayStation 5 Slim": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop",
            "Sony WH-1000XM5": "https://images.unsplash.com/photo-1618366712010-8c0e2e20601d?q=80&w=800&auto=format&fit=crop",
            "iPad Pro M4": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
            "Nintendo Switch OLED": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=800&auto=format&fit=crop",
            "Apple Watch Ultra": "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop",
            "Bose QuietComfort": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
            "GoPro HERO12": "https://images.unsplash.com/photo-1524333865941-2418e26526a7?q=80&w=800&auto=format&fit=crop"
        }

        # New products to add if they don't exist
        new_items = [
            {
                "name": "Apple Watch Ultra",
                "brand": "Apple",
                "sku": "AW-ULTRA-2",
                "category": "Wearables",
                "price": 89900,
                "cost_price": 75000,
                "image_url": "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop",
                "stock_qty": 8
            },
            {
                "name": "Bose QuietComfort",
                "brand": "Bose",
                "sku": "BOSE-QC-45",
                "category": "Accessories",
                "price": 29900,
                "cost_price": 22000,
                "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
                "stock_qty": 15
            }
        ]

        # 1. Update existing products
        products = db.query(models.Product).all()
        for p in products:
            if p.name in image_map:
                p.image_url = image_map[p.name]
            else:
                # Default high-quality tech image
                p.image_url = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop"

        # 2. Add new items
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
        print("All products updated with accurate, high-quality photos.")
    finally:
        db.close()

if __name__ == "__main__":
    update_all_images_accurately()
