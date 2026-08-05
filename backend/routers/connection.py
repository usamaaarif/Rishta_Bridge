from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from datetime import datetime

from database import get_db
import models, schemas
from utils import get_current_user

router = APIRouter(
    prefix="/connections",
    tags=["Connections"],
)

@router.post("/request", response_model=schemas.ConnectionResponse)
def send_request(
    payload: schemas.ConnectionCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.profile:
        raise HTTPException(status_code=400, detail="User must have a profile to connect")
        
    if payload.recipient_profile_id == current_user.profile.id:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")

    # Check if target profile exists
    target_profile = db.query(models.Profile).filter(models.Profile.id == payload.recipient_profile_id).first()
    if not target_profile:
        raise HTTPException(status_code=404, detail="Target profile not found")

    # Check if a connection already exists
    existing_conn = db.query(models.Connection).filter(
        or_(
            and_(models.Connection.requester_id == current_user.profile.id, models.Connection.recipient_id == payload.recipient_profile_id),
            and_(models.Connection.requester_id == payload.recipient_profile_id, models.Connection.recipient_id == current_user.profile.id)
        )
    ).first()

    if existing_conn:
        raise HTTPException(status_code=400, detail=f"Connection already exists with status: {existing_conn.status}")

    new_conn = models.Connection(
        requester_id=current_user.profile.id,
        recipient_id=payload.recipient_profile_id,
        status=models.ConnectionStatus.PENDING.value
    )
    db.add(new_conn)
    db.commit()
    db.refresh(new_conn)
    return new_conn

@router.post("/{connection_id}/accept", response_model=schemas.ConnectionResponse)
def accept_request(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.profile:
        raise HTTPException(status_code=400, detail="User must have a profile")

    conn = db.query(models.Connection).filter(models.Connection.id == connection_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if conn.recipient_id != current_user.profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this request")
    
    if conn.status != models.ConnectionStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Only pending requests can be accepted")

    conn.status = models.ConnectionStatus.ACCEPTED.value
    conn.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(conn)
    return conn

@router.post("/{connection_id}/reject", response_model=schemas.ConnectionResponse)
def reject_request(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.profile:
        raise HTTPException(status_code=400, detail="User must have a profile")

    conn = db.query(models.Connection).filter(models.Connection.id == connection_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if conn.recipient_id != current_user.profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to reject this request")

    if conn.status != models.ConnectionStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Only pending requests can be rejected")

    conn.status = models.ConnectionStatus.DECLINED.value
    conn.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(conn)
    return conn

@router.get("/", response_model=List[schemas.ConnectionResponse])
def list_connections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.profile:
        return []

    connections = db.query(models.Connection).filter(
        or_(
            models.Connection.requester_id == current_user.profile.id,
            models.Connection.recipient_id == current_user.profile.id
        )
    ).all()
    return connections
