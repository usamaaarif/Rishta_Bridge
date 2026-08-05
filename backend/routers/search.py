from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, cast, Integer, Date
from typing import List
from datetime import datetime
from dateutil.relativedelta import relativedelta

from database import get_db
import models, schemas
from utils import get_current_user

router = APIRouter(
    prefix="/search",
    tags=["Search & Discovery"],
)

@router.post("/profiles", response_model=List[schemas.ProfileResponse])
def search_profiles(
    filters: schemas.SearchFilterRequest,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    # For now, allow unauthenticated search for public browse, or require user. 
    # Let's make it require user for privacy, or make user optional
):
    query = db.query(models.Profile).filter(
        models.Profile.profile_visibility == models.ProfileVisibility.PUBLIC.value
    )

    if filters.gender:
        query = query.filter(models.Profile.gender == filters.gender)
    if filters.sect:
        query = query.filter(models.Profile.sect == filters.sect)
    if filters.marital_status:
        query = query.filter(models.Profile.marital_status == filters.marital_status)

    if filters.caste:
        query = query.filter(models.Profile.caste == filters.caste)

    if filters.city:
        query = query.filter(models.Profile.city == filters.city)
    elif filters.state:
        query = query.filter(models.Profile.state == filters.state)
    elif filters.country:
        query = query.filter(models.Profile.country == filters.country)

    if filters.min_height:
        query = query.filter(models.Profile.height == filters.min_height)
    if filters.education:
        query = query.filter(models.Profile.education_level == filters.education)

    # Calculate DOB bounds from age
    now = datetime.utcnow()
    if filters.min_age:
        max_dob = now - relativedelta(years=filters.min_age)
        query = query.filter(models.Profile.dob <= max_dob)
    if filters.max_age:
        min_dob = now - relativedelta(years=filters.max_age + 1)
        query = query.filter(models.Profile.dob >= min_dob)

    # Basic ranking: newest first
    query = query.order_by(models.Profile.created_at.desc())
    
    results = query.limit(limit).offset(offset).all()
    
    from routers.profile import serialize_profile
    return [serialize_profile(p, p.user, db) for p in results]
