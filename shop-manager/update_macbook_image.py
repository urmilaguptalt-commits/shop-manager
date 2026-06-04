from backend.database import SessionLocal
from backend import models

def update_macbook_image():
    db = SessionLocal()
    try:
        # Find product with ID corresponding to the 4th in the list (or by name)
        product = db.query(models.Product).filter(models.Product.name == "MacBook Air M3").first()
        if product:
            product.image_url = 'http://localhost:8000/static/products/macbook_air_m3.jpg'
            db.commit()
            print(f"Updated {product.name} image to {product.image_url}")
        else:
            print("Product MacBook Air M3 not found")
    finally:
        db.close()

if __name__ == "__main__":
    update_macbook_image()
