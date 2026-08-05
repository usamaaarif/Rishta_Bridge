from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
import uuid
import models, utils, database

router = APIRouter(prefix="/verification", tags=["Verification"])

UPLOAD_DIR = "static/uploads"

@router.post("/cnic")
async def upload_cnic(
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(...),
    current_user: models.User = Depends(utils.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Ensure directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filenames
    front_filename = f"{current_user.id}_front_{uuid.uuid4()}.jpg"
    back_filename = f"{current_user.id}_back_{uuid.uuid4()}.jpg"
    
    front_path = os.path.join(UPLOAD_DIR, front_filename)
    back_path = os.path.join(UPLOAD_DIR, back_filename)
    
    # Save files
    with open(front_path, "wb") as buffer:
        shutil.copyfileobj(front_image.file, buffer)
        
    with open(back_path, "wb") as buffer:
        shutil.copyfileobj(back_image.file, buffer)
        
    # Update User Status (Simulate 24hr manual review by auto-verifying for demo)
    current_user.is_cnic_verified = True
    db.commit()
    
    return {
        "message": "CNIC uploaded successfully. Verification pending (Simulated: Approved).",
        "front_url": f"/static/uploads/{front_filename}",
        "back_url": f"/static/uploads/{back_filename}"
    }
