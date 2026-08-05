from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from utils import get_current_user
from routers.auth import get_password_hash

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)

def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/users", response_model=List[schemas.UserAdminResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    users = db.query(models.User).all()
    # Manually map has_profile since it's not a DB column directly accessible via from_attributes without a property
    result = []
    for u in users:
        data = {
            "id": str(u.id),
            "email": u.email,
            "phone_number": u.phone_number,
            "auth_provider": u.auth_provider,
            "role": u.role,
            "is_verified": u.is_verified,
            "created_at": u.created_at,
            "has_profile": u.profile is not None if hasattr(u, 'profile') else len(u.profiles) > 0,
            "profile_limit": u.profile_limit
        }
        result.append(data)
    return result

@router.get("/profiles", response_model=List[schemas.ProfileResponse])
def get_all_profiles(
    profile_id: str = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    from routers.profile import serialize_profile
    query = db.query(models.Profile)
    
    if profile_id:
        query = query.filter(models.Profile.id == profile_id)
        
    profiles = query.all()
    return [serialize_profile(p, p.user, db) for p in profiles]

@router.post("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: str,
    payload: schemas.AdminResetPasswordRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}

@router.put("/users/{user_id}/limit")
def update_user_profile_limit(
    user_id: str,
    payload: schemas.AdminUpdateLimitRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.profile_limit = payload.new_limit
    db.commit()
    return {"message": "Profile limit updated successfully"}
