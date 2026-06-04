from backend.database import SessionLocal
from backend import models
import os

def update_iphone_image():
    db = SessionLocal()
    try:
        # Update the specific iPhone product
        product = db.query(models.Product).filter(models.Product.name.like('%iPhone 15 Pro%')).first()
        if product:
            # Using relative path for the frontend to fetch from backend/static
            # The backend mounts backend/static to /static
            product.image_url = 'http://localhost:8000/static/products/iphone15pro.jpg'
            db.commit()
            print(f"Updated {product.name} image to {product.image_url}")
        else:
            print("Product not found")
    finally:
        db.close()

if __name__ == "__main__":
    update_iphone_image()
