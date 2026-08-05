from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os

from database import get_db
from models import User
from schemas import GoogleAuthRequest, PhoneRequest, OtpVerifyRequest, Token
from utils import create_access_token, get_redis

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "dummy_client_id")

import re

def normalize_to_e164(phone: str) -> str:
    # Basic normalization for demo. Strip spaces and dashes.
    phone = re.sub(r'[^\d+]', '', phone)
    if phone.startswith("0"):
        return "+92" + phone[1:]
    if not phone.startswith("+"):
        return "+" + phone
    return phone

import httpx

@router.post("/google", response_model=Token)
async def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    if GOOGLE_CLIENT_ID == "dummy_client_id":
        # Mock Google Auth for local dev without Client ID
        print("MOCKING GOOGLE AUTH - No Client ID provided")
        google_id = "mock_" + payload.access_token[:10]
        email = "mock@example.com"
    else:
        # Verify access_token via Google's userinfo endpoint
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {payload.access_token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google access token")
            
            user_info = response.json()
            google_id = user_info.get("sub")
            email = user_info.get("email")
            
            if not google_id:
                raise HTTPException(status_code=401, detail="Invalid Google token data")

    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = User(
            google_id=google_id,
            email=email,
            auth_provider="google",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": len(user.profiles) == 0,
        "role": user.role
    }

@router.post("/phone/request-otp")
async def request_otp(payload: PhoneRequest, db: Session = Depends(get_db)):
    redis = get_redis()
    phone = normalize_to_e164(payload.phone_number)

    key = f"otp_rate:{phone}"
    rate_count = redis.get(key)
    if rate_count and int(rate_count) >= 3:
        raise HTTPException(status_code=429, detail="Too many OTP requests. Try again later.")
    
    redis.incr(key)
    redis.expire(key, 600)

    # Generate random 6-digit OTP for production
    otp = f"{random.randint(100000, 999999)}"
    
    redis.setex(f"otp:{phone}", 300, otp)
    
    # TODO: Integrate with real SMS gateway (e.g., Twilio, MSG91) here
    print(f"--- SMS GATEWAY PLACEHOLDER: SENT TO {phone}: Your RishtaBridge OTP is {otp} ---")
    
    return {"message": "OTP sent successfully"}

@router.post("/phone/verify-otp", response_model=Token)
async def verify_otp(payload: OtpVerifyRequest, db: Session = Depends(get_db)):
    redis = get_redis()
    phone = normalize_to_e164(payload.phone_number)
    
    stored_otp = redis.get(f"otp:{phone}")
    
    if not stored_otp or stored_otp.decode("utf-8") != payload.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
        
    redis.delete(f"otp:{phone}")

    user = db.query(User).filter(User.phone_number == phone).first()
    if not user:
        user = User(
            phone_number=phone,
            auth_provider="phone",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": len(user.profiles) == 0,
        "role": user.role
    }

import bcrypt
from fastapi.security import OAuth2PasswordRequestForm
from schemas import PasswordRegisterRequest

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/register")
async def register(payload: PasswordRegisterRequest, db: Session = Depends(get_db)):
    phone = normalize_to_e164(payload.phone_number)
    user = db.query(User).filter(User.phone_number == phone).first()
    
    if user:
        if user.password_hash:
            raise HTTPException(status_code=400, detail="User already registered with password")
        # If user exists from OTP but has no password, let them set it now
        user.password_hash = get_password_hash(payload.password)
        user.role = payload.role
        db.commit()
    else:
        user = User(
            phone_number=phone,
            password_hash=get_password_hash(payload.password),
            role=payload.role,
            auth_provider="phone",
            is_verified=True # Assuming OTP was verified before this step
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {"message": "User registered successfully"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    identifier = form_data.username.strip()
    
    if '@' in identifier:
        user = db.query(User).filter(User.email == identifier.lower()).first()
    else:
        phone = normalize_to_e164(identifier)
        user = db.query(User).filter(User.phone_number == phone).first()
    
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": len(user.profiles) == 0,
        "role": user.role
    }

from schemas import ChangePasswordRequest
from utils import get_current_user

@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not current_user.password_hash:
        raise HTTPException(status_code=400, detail="Account does not use password authentication")
        
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect old password")
        
    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "role": current_user.role,
        "profile_limit": current_user.profile_limit
    }
