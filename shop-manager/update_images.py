from backend.database import SessionLocal
from backend import models

def update_product_images():
    db = SessionLocal()
    try:
        # Mapping products to high quality unsplash images
        image_map = {
            "iPhone 15 Pro": "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop",
            "Galaxy S24 Ultra": "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=800&auto=format&fit=crop",
            "MacBook Air M3": "https://images.unsplash.com/photo-1517336714460-4c50d117900b?q=80&w=800&auto=format&fit=crop",
            "Dell XPS 15": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&auto=format&fit=crop",
            "Samsung QLED TV": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop",
            "Legion Pro Max": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
            "X-Phone Ultra": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
            "Chronos Watch V2": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
            "Aura Sound Pro": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
            "Alpha Cam Z9": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
            "Tab Master X": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
            "Aero Drone 4K": "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800&auto=format&fit=crop",
            "Vision VR Pro": "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
            "Nexus Station": "https://images.unsplash.com/photo-1486401899868-2e9354a5abab?q=80&w=800&auto=format&fit=crop",
            "Echo Base 360": "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=800&auto=format&fit=crop",
        }

        products = db.query(models.Product).all()
        for p in products:
            if p.name in image_map:
                p.image_url = image_map[p.name]
            else:
                # Default tech image
                p.image_url = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop"
        
        db.commit()
        print("Updated product image URLs.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_product_images()
