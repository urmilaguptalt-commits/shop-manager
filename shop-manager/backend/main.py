from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import auth, products, invoices, customers, suppliers, reports, rma, purchases
from . import models, security

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup: seed default admin if no users exist ──
    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        if user_count == 0:
            default_admin = models.User(
                name="Admin",
                email="admin@shop.com",
                password_hash=security.get_password_hash("admin123"),
                role="owner"
            )
            db.add(default_admin)
            db.commit()
            print("Default admin created: admin@shop.com / admin123")
        else:
            print(f"{user_count} user(s) already exist - skipping seed.")
    finally:
        db.close()
    yield
    # ── Shutdown ──

app = FastAPI(title="Shop Management API", lifespan=lifespan)

# Configure CORS for React frontend (Vite defaults to 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(rma.router, prefix="/rma", tags=["Warranty & Repair"])
app.include_router(purchases.router, prefix="/purchases", tags=["Purchase Orders"])

# Mount static files
app.mount("/static", StaticFiles(directory="backend/static"), name="static")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Shop Management API"}

