from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter(
    prefix="/reference",
    tags=["Reference Data"],
)

@router.get("/castes", response_model=List[schemas.CasteResponse])
def get_castes(db: Session = Depends(get_db)):
    return db.query(models.Caste).all()

@router.get("/locations/countries", response_model=List[schemas.LocationCountryResponse])
def get_countries(db: Session = Depends(get_db)):
    return db.query(models.LocationCountry).all()

@router.get("/locations/states/{country_id}", response_model=List[schemas.LocationStateResponse])
def get_states(country_id: int, db: Session = Depends(get_db)):
    return db.query(models.LocationState).filter(models.LocationState.country_id == country_id).all()

@router.get("/locations/cities/{state_id}", response_model=List[schemas.LocationCityResponse])
def get_cities(state_id: int, db: Session = Depends(get_db)):
    return db.query(models.LocationCity).filter(models.LocationCity.state_id == state_id).all()
