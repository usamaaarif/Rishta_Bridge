from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from utils import get_current_user

router = APIRouter(
    prefix="/moderation",
    tags=["Moderation"],
)

def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/photos/pending", response_model=List[schemas.PhotoResponse])
def get_pending_photos(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    photos = db.query(models.ProfilePhoto).filter(models.ProfilePhoto.moderation_status == "pending").all()
    return photos

@router.post("/photos/{photo_id}/decision", response_model=schemas.PhotoResponse)
def decide_photo(
    photo_id: str,
    payload: schemas.ModerationDecisionRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    photo = db.query(models.ProfilePhoto).filter(models.ProfilePhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    if payload.action == "approve":
        photo.moderation_status = "approved"
    elif payload.action == "reject":
        photo.moderation_status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    log = models.ModerationLog(
        admin_id=admin.id,
        target_type="photo",
        target_id=photo.id,
        action=payload.action,
        reason=payload.reason,
        notes=payload.notes
    )
    db.add(log)
    
    db.commit()
    db.refresh(photo)
    return photo

@router.get("/cnic/pending", response_model=List[schemas.VerificationResponse])
def get_pending_cnics(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    cnics = db.query(models.Verification).filter(
        models.Verification.type == models.VerificationType.CNIC.value,
        models.Verification.status == models.VerificationStatus.PENDING.value
    ).all()
    return cnics

@router.post("/cnic/{verification_id}/decision", response_model=schemas.VerificationResponse)
def decide_cnic(
    verification_id: str,
    payload: schemas.ModerationDecisionRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    verification = db.query(models.Verification).filter(models.Verification.id == verification_id).first()
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    if payload.action == "approve":
        verification.status = models.VerificationStatus.VERIFIED.value
        # Set user as verified
        user = db.query(models.User).filter(models.User.id == verification.user_id).first()
        if user:
            user.is_verified = True
    elif payload.action == "reject":
        verification.status = models.VerificationStatus.REJECTED.value
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    log = models.ModerationLog(
        admin_id=admin.id,
        target_type="cnic",
        target_id=verification.id,
        action=payload.action,
        reason=payload.reason,
        notes=payload.notes
    )
    db.add(log)
    
    db.commit()
    db.refresh(verification)
    return verification
