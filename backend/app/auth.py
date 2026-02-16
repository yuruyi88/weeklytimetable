from __future__ import annotations

import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from . import database

# Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
MAX_PIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 5


def hash_pin(pin: str) -> str:
    """Hash a PIN using bcrypt."""
    return bcrypt.hashpw(pin.encode(), bcrypt.gensalt(rounds=12)).decode()


def verify_pin(pin: str, pin_hash: str) -> bool:
    """Verify a PIN against its hash."""
    return bcrypt.checkpw(pin.encode(), pin_hash.encode())


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None


# HTTP Bearer for extracting the token
security = HTTPBearer(auto_error=False)


async def get_current_auth(request: Request) -> dict:
    """
    Dependency to verify JWT token from Authorization header.
    Raises HTTPException if token is missing or invalid.
    """
    credentials: HTTPAuthorizationCredentials = await security(request)
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload


# Export the dependency
pin_auth = get_current_auth


def check_rate_limit(ip_address: str) -> bool:
    """Check if IP is rate limited due to failed attempts."""
    # Clear old attempts first
    database.clear_old_attempts()
    
    # Count recent failed attempts
    failed_attempts = database.get_recent_failed_attempts(ip_address, LOCKOUT_MINUTES)
    return failed_attempts >= MAX_PIN_ATTEMPTS


def authenticate_pin(pin: str, ip_address: str) -> Optional[str]:
    """
    Authenticate a PIN and return a token if valid.
    Implements rate limiting.
    """
    # Check rate limit
    if check_rate_limit(ip_address):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Please try again in {LOCKOUT_MINUTES} minutes."
        )
    
    # Get stored PIN hash
    pin_hash = database.get_pin_hash()
    
    if not pin_hash:
        # No PIN set - authentication not possible
        database.record_pin_attempt(ip_address, success=False)
        return None
    
    # Verify PIN
    if verify_pin(pin, pin_hash):
        database.record_pin_attempt(ip_address, success=True)
        # Create and return token
        token = create_access_token({"authenticated": True})
        return token
    else:
        database.record_pin_attempt(ip_address, success=False)
        return None


def setup_pin(pin: str) -> bool:
    """Set up initial PIN. Returns False if PIN already set."""
    existing_hash = database.get_pin_hash()
    if existing_hash:
        return False
    
    pin_hash = hash_pin(pin)
    database.set_pin_hash(pin_hash)
    return True


def change_pin(old_pin: str, new_pin: str) -> bool:
    """Change existing PIN. Returns False if old PIN is incorrect."""
    existing_hash = database.get_pin_hash()
    if not existing_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No PIN is currently set"
        )
    
    if not verify_pin(old_pin, existing_hash):
        return False
    
    new_hash = hash_pin(new_pin)
    database.set_pin_hash(new_hash)
    return True


def is_pin_set() -> bool:
    """Check if a PIN has been set up."""
    return database.get_pin_hash() is not None
