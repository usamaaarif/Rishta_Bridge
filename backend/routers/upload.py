from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from utils import get_current_user
import uuid
import os
import shutil

router = APIRouter(
    prefix="/upload",
    tags=["Uploads"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/image")
def upload_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    # Generate a unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file locally (Fallback for S3)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/static/uploads/{unique_filename}"}

@router.post("/cnic")
def upload_cnic(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Generate a unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"cnic_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file locally (Fallback for S3)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/static/uploads/{unique_filename}"

    # Check if a verification request already exists
    verification = db.query(models.Verification).filter(
        models.Verification.user_id == current_user.id,
        models.Verification.type == models.VerificationType.CNIC.value
    ).first()

    if verification:
        verification.status = models.VerificationStatus.PENDING.value
        verification.metadata_json = url
    else:
        verification = models.Verification(
            user_id=current_user.id,
            type=models.VerificationType.CNIC.value,
            status=models.VerificationStatus.PENDING.value,
            metadata_json=url
        )
        db.add(verification)
    
    db.commit()

    return {"message": "CNIC uploaded successfully and is pending verification.", "url": url}
