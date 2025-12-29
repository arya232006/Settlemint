from fastapi import FastAPI
from app.config import settings
from app.api import users, expenses, payments, groups
from app.db.session import engine
from app.db.base import Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(groups.router, prefix="/groups", tags=["groups"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])

@app.get("/")
def root():
    return {"message": "Welcome to Expense Settlement System"}
