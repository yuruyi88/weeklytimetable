from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ============== Event Models ==============

class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")  # HH:MM format
    end_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    days: List[int] = Field(..., min_length=1)  # 0=Monday, 6=Sunday
    color: str = Field(default="#3B82F6", pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: str = Field(default="📅")


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    start_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    end_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    days: Optional[List[int]] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None


class Event(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============== Auth Models ==============

class PINSetup(BaseModel):
    pin: str = Field(..., min_length=4, max_length=6, pattern=r"^\d+$")


class PINVerify(BaseModel):
    pin: str = Field(..., min_length=4, max_length=6, pattern=r"^\d+$")


class PINChange(BaseModel):
    old_pin: str = Field(..., min_length=4, max_length=6, pattern=r"^\d+$")
    new_pin: str = Field(..., min_length=4, max_length=6, pattern=r"^\d+$")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ============== Settings Models ==============

class SettingsBase(BaseModel):
    timezone: str = Field(default="Pacific/Auckland")
    notifications_enabled: bool = Field(default=False)
    theme: str = Field(default="default")
    title: str = Field(default="My Timetable")


class SettingsUpdate(BaseModel):
    timezone: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    theme: Optional[str] = None
    title: Optional[str] = None


class Settings(SettingsBase):
    pin_is_set: bool = False


# ============== Error Models ==============

class ErrorResponse(BaseModel):
    detail: str
