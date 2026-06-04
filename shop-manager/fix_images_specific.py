from backend.database import SessionLocal
from backend import models

def fix_images():
    db = SessionLocal()
    try:
        # iPhone 15 Pro
        iphone = db.query(models.Product).filter(models.Product.name.like('%iPhone 15 Pro%')).first()
        if iphone:
            iphone.image_url = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'
        
        # Redmi Pad
        redmi = db.query(models.Product).filter(models.Product.name.like('%Redmi Pad%')).first()
        if redmi:
            redmi.image_url = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800'
            
        db.commit()
        print("Images fixed successfully")
    finally:
        db.close()

if __name__ == "__main__":
    fix_images()
