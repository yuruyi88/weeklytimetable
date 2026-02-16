from __future__ import annotations

from fastapi import APIRouter, HTTPException, status, Depends

from .. import database
from ..models import Settings, SettingsUpdate
from ..auth import pin_auth

router = APIRouter()


@router.get("", response_model=Settings)
async def get_settings():
    """Get application settings. Public endpoint."""
    return database.get_settings()


@router.put("", response_model=Settings)
async def update_settings(
    settings: SettingsUpdate,
    auth: dict = Depends(pin_auth)
):
    """Update application settings. Requires PIN authentication."""
    update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
    updated = database.update_settings(update_data)
    return updated
