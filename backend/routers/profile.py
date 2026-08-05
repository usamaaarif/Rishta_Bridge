from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Profile, User, Preference
from schemas import ProfileCreate, ProfileResponse
from utils import get_current_user

router = APIRouter(
    prefix="/profiles",
    tags=["Profiles"],
)

def serialize_profile(profile: Profile, current_user: User, db: Session):
    pref = db.query(Preference).filter(Preference.profile_id == profile.id).first()
    
    resp = {
        "id": profile.id,
        "user_id": profile.user_id,
        "profile_visibility": profile.profile_visibility,
        "photo_blur_until_connected": profile.photo_blur_until_connected,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
        "photos": profile.photos,
        
        "name": profile.full_name,
        "location_city": profile.city,
        "profile_description": profile.bio,
        "email": current_user.email,
        "dob": profile.dob.isoformat() if profile.dob else None,
        "image_url": profile.photos[0].image_url if profile.photos else None
    }
    
    for col in profile.__table__.columns:
        if col.name not in ["id", "user_id", "full_name", "city", "bio", "profile_visibility", "photo_blur_until_connected", "created_at", "updated_at", "dob"]:
            resp[col.name] = getattr(profile, col.name)
            
    if pref:
        for col in pref.__table__.columns:
            if col.name not in ["id", "profile_id"]:
                resp[col.name] = getattr(pref, col.name)
                
    return resp

@router.post("/", response_model=ProfileResponse)
async def create_profile(
    profile_data: ProfileCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != 'admin':
        if len(current_user.profiles) >= current_user.profile_limit:
            raise HTTPException(status_code=403, detail="Profile limit reached. Please contact admin to increase your limit.")

    data_dict = profile_data.model_dump()
    
    pref_keys = ['partner_looking_for', 'partner_age_min', 'partner_age_max', 'partner_country', 'partner_min_height']
    pref_data = {k: data_dict.pop(k, None) for k in pref_keys}
    
    image_url = data_dict.pop('image_url', None)
    
    data_dict['full_name'] = data_dict.pop('name', None)
    data_dict['city'] = data_dict.pop('location_city', None)
    data_dict['bio'] = data_dict.pop('profile_description', None)
    
    email = data_dict.pop('email', None)
    if email and not current_user.email:
        current_user.email = email
        db.add(current_user)
    
    dob_str = data_dict.get('dob')
    if dob_str:
        try:
            from datetime import datetime
            data_dict['dob'] = datetime.strptime(dob_str, "%Y-%m-%d")
        except:
            data_dict['dob'] = None
    else:
        data_dict['dob'] = None
            
    new_profile = Profile(user_id=current_user.id, **data_dict)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    new_preference = Preference(profile_id=new_profile.id, **pref_data)
    db.add(new_preference)
    
    if image_url:
        from models import ProfilePhoto
        new_photo = ProfilePhoto(
            profile_id=new_profile.id,
            image_url=image_url,
            is_primary=True,
            moderation_status="approved"
        )
        db.add(new_photo)
        
    db.commit()
    db.refresh(new_profile)
    return serialize_profile(new_profile, current_user, db)

@router.get("/me", response_model=List[ProfileResponse])
async def get_my_profile(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    profiles = db.query(Profile).filter(Profile.user_id == current_user.id).all()
    return [serialize_profile(p, current_user, db) for p in profiles]
@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: str,
    profile_data: ProfileCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    if profile.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to edit this profile")

    data_dict = profile_data.model_dump()
    
    pref_keys = ['partner_looking_for', 'partner_age_min', 'partner_age_max', 'partner_country', 'partner_min_height']
    pref_data = {k: data_dict.pop(k, None) for k in pref_keys}
    
    image_url = data_dict.pop('image_url', None)
    
    data_dict['full_name'] = data_dict.pop('name', None)
    data_dict['city'] = data_dict.pop('location_city', None)
    data_dict['bio'] = data_dict.pop('profile_description', None)
    
    email = data_dict.pop('email', None)
    if email and not current_user.email:
        current_user.email = email
        db.add(current_user)
    
    dob_str = data_dict.get('dob')
    if dob_str:
        try:
            from datetime import datetime
            data_dict['dob'] = datetime.strptime(dob_str, "%Y-%m-%d")
        except:
            data_dict['dob'] = None
    else:
        data_dict['dob'] = None
            
    for key, value in data_dict.items():
        if value is not None or key == 'dob': # allow clearing dob
            setattr(profile, key, value)
            
    db.add(profile)
    
    pref = db.query(Preference).filter(Preference.profile_id == profile.id).first()
    if not pref:
        pref = Preference(profile_id=profile.id, **pref_data)
    else:
        for key, value in pref_data.items():
            setattr(pref, key, value)
    db.add(pref)
    
    if image_url:
        from models import ProfilePhoto
        # just add a new primary photo
        new_photo = ProfilePhoto(
            profile_id=profile.id,
            image_url=image_url,
            is_primary=True,
            moderation_status="approved"
        )
        db.add(new_photo)
        
    db.commit()
    db.refresh(profile)
    return serialize_profile(profile, current_user, db)

@router.delete("/{profile_id}")
async def delete_profile(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    if profile.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to delete this profile")
        
    db.delete(profile)
    db.commit()
    return {"message": "Profile deleted successfully"}
