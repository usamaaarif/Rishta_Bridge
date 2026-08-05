from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List

from database import get_db
import models, schemas
from utils import get_current_user

router = APIRouter(
    prefix="/messages",
    tags=["Messaging"],
)

@router.post("/{connection_id}", response_model=schemas.MessageResponse)
def send_message(
    connection_id: str,
    payload: schemas.MessageCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.profile:
        raise HTTPException(status_code=400, detail="User must have a profile")

    conn = db.query(models.Connection).filter(models.Connection.id == connection_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if current_user.profile.id not in [conn.requester_id, conn.recipient_id]:
        raise HTTPException(status_code=403, detail="Not part of this connection")
        
    if conn.status != models.ConnectionStatus.ACCEPTED.value:
        raise HTTPException(status_code=403, detail="Can only send messages in accepted connections")

    msg = models.Message(
        connection_id=connection_id,
        sender_id=current_user.profile.id,
        body=payload.body
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@router.get("/{connection_id}", response_model=List[schemas.MessageResponse])
def get_messages(
    connection_id: str,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.profile:
        raise HTTPException(status_code=400, detail="User must have a profile")

    conn = db.query(models.Connection).filter(models.Connection.id == connection_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if current_user.profile.id not in [conn.requester_id, conn.recipient_id]:
        raise HTTPException(status_code=403, detail="Not part of this connection")

    messages = db.query(models.Message).filter(
        models.Message.connection_id == connection_id
    ).order_by(models.Message.sent_at.asc()).limit(limit).offset(offset).all()
    
    return messages
