from __future__ import annotations

from typing import List
from fastapi import APIRouter, HTTPException, status, Depends

from .. import database
from ..models import Event, EventCreate, EventUpdate
from ..auth import pin_auth

router = APIRouter()


@router.get("/events", response_model=List[Event])
async def list_events():
    """Get all events. Public endpoint - no PIN required."""
    events = database.get_all_events()
    return events


@router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: int):
    """Get a specific event by ID. Public endpoint."""
    event = database.get_event(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event


@router.post("/events", response_model=Event, status_code=status.HTTP_201_CREATED)
async def create_event(
    event: EventCreate,
    auth: dict = Depends(pin_auth)
):
    """Create a new event. Requires PIN authentication."""
    event_data = event.model_dump()
    created = database.create_event(event_data)
    return created


@router.put("/events/{event_id}", response_model=Event)
async def update_event(
    event_id: int,
    event: EventUpdate,
    auth: dict = Depends(pin_auth)
):
    """Update an existing event. Requires PIN authentication."""
    # Check if event exists
    existing = database.get_event(event_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Filter out None values
    update_data = {k: v for k, v in event.model_dump().items() if v is not None}
    
    updated = database.update_event(event_id, update_data)
    return updated


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    auth: dict = Depends(pin_auth)
):
    """Delete an event. Requires PIN authentication."""
    existing = database.get_event(event_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    database.delete_event(event_id)
    return None
