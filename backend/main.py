from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
# Temporarily disabling old routers since the core schema was rebuilt in Sprint 1
from routers import auth, profile, reference, search, connection, message, upload, moderation, admin
# from routers import verification
from fastapi.staticfiles import StaticFiles
import os

# Create tables based on new models
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Rishta App API - V2", description="Backend for Pakistani Matrimonial Service")

# CORS
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(reference.router)
app.include_router(search.router)
app.include_router(connection.router)
app.include_router(message.router)
app.include_router(upload.router)
app.include_router(moderation.router)
app.include_router(admin.router)
# app.include_router(verification.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the RishtaBridge Production API - Sprint 5"}
