from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Union
from datetime import datetime

# --- Auth Schemas ---
class GoogleAuthRequest(BaseModel):
    access_token: str

class PhoneRequest(BaseModel):
    phone_number: str

class PasswordRegisterRequest(BaseModel):
    phone_number: str
    password: str
    role: str

class OtpVerifyRequest(BaseModel):
    phone_number: str
    otp: str

class Token(BaseModel):
    access_token: str
    token_type: str
    is_new_user: bool
    role: str

# --- User Schemas ---
class UserBase(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    is_verified: bool

class UserResponse(UserBase):
    id: str
    auth_provider: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class AdminResetPasswordRequest(BaseModel):
    new_password: str

class AdminUpdateLimitRequest(BaseModel):
    new_limit: int

class UserAdminResponse(BaseModel):
    id: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    auth_provider: str
    role: str
    is_verified: bool
    created_at: datetime
    has_profile: bool
    profile_limit: int = 3

    class Config:
        from_attributes = True

class ModerationDecisionRequest(BaseModel):
    action: str # approve, reject
    reason: Optional[str] = None
    notes: Optional[str] = None

class VerificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    status: str
    metadata_json: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- Profile Schemas ---
class ProfileCreate(BaseModel):
    profile_description: Optional[str] = None
    image_url: Optional[str] = None
    profile_creator: Optional[str] = None
    name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    mother_tongue: Optional[str] = None
    email: Optional[str] = None
    marital_status: Optional[str] = None
    children_count: Optional[str] = None
    children_living_with_me: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    location_city: Optional[str] = None
    citizenship: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    complexion: Optional[str] = None
    body_type: Optional[str] = None
    smoke: Optional[str] = None
    drink: Optional[str] = None
    religion: Optional[str] = None
    sect: Optional[str] = None
    caste: Optional[str] = None
    sub_caste: Optional[str] = None
    education_level: Optional[str] = None
    profession: Optional[str] = None
    monthly_income: Optional[str] = None
    religiousness: Optional[str] = None
    brothers_count: Optional[str] = None
    married_brothers_count: Optional[str] = None
    sisters_count: Optional[str] = None
    married_sisters_count: Optional[str] = None
    family_description: Optional[str] = None
    partner_looking_for: Optional[str] = None
    partner_age_min: Optional[Union[int, str]] = None
    partner_age_max: Optional[Union[int, str]] = None
    partner_country: Optional[str] = None
    partner_min_height: Optional[str] = None

class PhotoResponse(BaseModel):
    id: str
    s3_key: Optional[str] = None
    image_url: Optional[str] = None
    is_primary: bool
    moderation_status: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class ProfileResponse(ProfileCreate):
    id: str
    user_id: str
    profile_visibility: str
    photo_blur_until_connected: bool
    created_at: datetime
    updated_at: datetime
    photos: List[PhotoResponse] = []

    class Config:
        from_attributes = True

# --- Reference Data Schemas ---
class CasteResponse(BaseModel):
    id: int
    name: str
    region_tags: Optional[str] = None
    
    class Config:
        from_attributes = True

class LocationCountryResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class LocationStateResponse(BaseModel):
    id: int
    name: str
    country_id: int
    class Config:
        from_attributes = True

class LocationCityResponse(BaseModel):
    id: int
    name: str
    state_id: int
    class Config:
        from_attributes = True

# --- Search Schemas ---
class SearchFilterRequest(BaseModel):
    gender: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    min_height: Optional[str] = None
    sect: Optional[str] = None
    caste: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    marital_status: Optional[str] = None
    education: Optional[str] = None

# --- Connection Schemas ---
class ConnectionCreateRequest(BaseModel):
    recipient_profile_id: str

class ConnectionResponse(BaseModel):
    id: str
    requester_id: str
    recipient_id: str
    status: str
    requested_at: datetime
    responded_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# --- Message Schemas ---
class MessageCreateRequest(BaseModel):
    body: str

class MessageResponse(BaseModel):
    id: str
    connection_id: str
    sender_id: str
    body: str
    sent_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
