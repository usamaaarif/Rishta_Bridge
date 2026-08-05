import uuid
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum, Text, DateTime, Float, Index
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

# --- Enums ---
class AuthProvider(str, enum.Enum):
    GOOGLE = "google"
    PHONE = "phone"
    EMAIL = "email"

class UserRole(str, enum.Enum):
    SELF = "self"
    PARENT = "parent"
    SIBLING = "sibling"
    ADMIN = "admin"

class Gender(str, enum.Enum):
    MALE = "Male"
    FEMALE = "Female"

class Sect(str, enum.Enum):
    SUNNI = "Sunni"
    SHIA = "Shia"
    AHLE_HADITH = "Ahle Hadith"
    OTHER = "Other"

class FamilyType(str, enum.Enum):
    NUCLEAR = "Nuclear"
    JOINT = "Joint"

class ProfileVisibility(str, enum.Enum):
    PUBLIC = "public"
    CONNECTIONS_ONLY = "connections_only"
    HIDDEN = "hidden"

class ConnectionStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    BLOCKED = "blocked"

class VerificationType(str, enum.Enum):
    MOBILE_OTP = "mobile_otp"
    CNIC = "cnic"
    VOICE_PROFILE = "voice_profile"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

# --- Tables ---
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    auth_provider = Column(String, default=AuthProvider.PHONE.value)
    google_id = Column(String, nullable=True, unique=True, index=True)
    phone_number = Column(String, nullable=True, unique=True, index=True) # E.164 format
    email = Column(String, nullable=True, unique=True, index=True)
    password_hash = Column(String, nullable=True) # Fallback
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default=UserRole.SELF.value)
    profile_limit = Column(Integer, default=3)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    profiles = relationship("Profile", back_populates="user")


class Caste(Base):
    __tablename__ = "castes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    region_tags = Column(String, nullable=True) # Could be JSONB or comma separated


class LocationCountry(Base):
    __tablename__ = "locations_country"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)


class LocationState(Base):
    __tablename__ = "locations_state"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("locations_country.id"))
    name = Column(String, index=True)


class LocationCity(Base):
    __tablename__ = "locations_city"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("locations_state.id"))
    name = Column(String, index=True)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), index=True)
    
    # 1. Basic Info
    profile_creator = Column(String, nullable=True)
    full_name = Column(String)
    gender = Column(String)
    dob = Column(DateTime, nullable=True)
    mother_tongue = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    children_count = Column(String, nullable=True)
    children_living_with_me = Column(String, nullable=True)
    
    # 2. Location
    country = Column(String, nullable=True)
    state = Column(String, nullable=True)
    city = Column(String, nullable=True)
    citizenship = Column(String, nullable=True)
    
    # 3. Appearance
    height = Column(String, nullable=True)
    weight = Column(String, nullable=True)
    complexion = Column(String, nullable=True)
    body_type = Column(String, nullable=True)
    smoke = Column(String, nullable=True)
    drink = Column(String, nullable=True)
    
    # 4. Cultural
    religion = Column(String, nullable=True)
    sect = Column(String, nullable=True)
    sub_sect = Column(String, nullable=True)
    caste = Column(String, nullable=True)
    sub_caste = Column(String, nullable=True)
    
    # 5. Education & Career
    education_level = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    monthly_income = Column(String, nullable=True)
    
    # 6. Family
    religiousness = Column(String, nullable=True)
    brothers_count = Column(String, nullable=True)
    married_brothers_count = Column(String, nullable=True)
    sisters_count = Column(String, nullable=True)
    married_sisters_count = Column(String, nullable=True)
    family_description = Column(Text, nullable=True)
    
    bio = Column(Text, nullable=True)
    profile_visibility = Column(String, default=ProfileVisibility.PUBLIC.value)
    photo_blur_until_connected = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profiles")
    preferences = relationship("Preference", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    photos = relationship("ProfilePhoto", back_populates="profile")


class ProfilePhoto(Base):
    __tablename__ = "profile_photos"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("profiles.id"))
    s3_key = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    moderation_status = Column(String, default="pending") # pending, approved, rejected
    
    profile = relationship("Profile", back_populates="photos")


class Preference(Base):
    __tablename__ = "preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("profiles.id"), unique=True)
    
    partner_looking_for = Column(String, nullable=True)
    partner_age_min = Column(String, nullable=True)
    partner_age_max = Column(String, nullable=True)
    partner_country = Column(String, nullable=True)
    partner_min_height = Column(String, nullable=True)

    profile = relationship("Profile", back_populates="preferences")


class Connection(Base):
    __tablename__ = "connections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id = Column(String(36), ForeignKey("profiles.id"))
    recipient_id = Column(String(36), ForeignKey("profiles.id"))
    status = Column(String, default=ConnectionStatus.PENDING.value)
    
    requested_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)

    requester = relationship("Profile", foreign_keys=[requester_id])
    recipient = relationship("Profile", foreign_keys=[recipient_id])


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connection_id = Column(String(36), ForeignKey("connections.id"))
    sender_id = Column(String(36), ForeignKey("profiles.id"))
    body = Column(Text)
    
    sent_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    type = Column(String) # VerificationType
    status = Column(String, default=VerificationStatus.PENDING.value)
    
    verified_at = Column(DateTime, nullable=True)
    # metadata_field is named metadata_json to avoid conflict with Base.metadata
    metadata_json = Column(String, nullable=True) # Use String for JSON serialization to support both sqlite and postgres


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reporter_id = Column(String(36), ForeignKey("profiles.id"))
    reported_profile_id = Column(String(36), ForeignKey("profiles.id"))
    reason = Column(Text)
    status = Column(String, default="pending") # pending, resolved
    created_at = Column(DateTime, default=datetime.utcnow)

class ModerationLog(Base):
    __tablename__ = "moderation_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id = Column(String(36), ForeignKey("users.id"))
    target_type = Column(String) # 'photo', 'cnic', 'voice', 'profile', 'report'
    target_id = Column(String(36))
    action = Column(String) # 'approve', 'reject', 'resubmit_requested', 'ban'
    reason = Column(String, nullable=True) # e.g. 'Blurry', 'Mismatch', 'Fake', 'Other'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Indices as recommended
Index('idx_preferences_filter', Profile.sect, Profile.caste, Profile.city, Profile.gender, Profile.marital_status)
Index('idx_profile_visibility', Profile.profile_visibility, postgresql_where=(Profile.profile_visibility == 'public'))
