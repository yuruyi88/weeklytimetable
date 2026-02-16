from __future__ import annotations

from fastapi import APIRouter, HTTPException, status, Request

from .. import auth as auth_module
from ..models import PINSetup, PINVerify, PINChange, Token, ErrorResponse

router = APIRouter()


def get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.get("/status")
async def auth_status():
    """Check if PIN has been set up."""
    return {
        "pin_is_set": auth_module.is_pin_set()
    }


@router.post("/setup", response_model=dict)
async def setup_pin(setup: PINSetup):
    """Set up initial PIN. Only works if no PIN is set."""
    if auth_module.is_pin_set():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN is already set. Use change endpoint to modify."
        )
    
    success = auth_module.setup_pin(setup.pin)
    if success:
        return {"message": "PIN set successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to set PIN"
        )


@router.post("/verify", response_model=Token)
async def verify_pin(verify: PINVerify, request: Request):
    """Verify PIN and return access token."""
    client_ip = get_client_ip(request)
    
    token = auth_module.authenticate_pin(verify.pin, client_ip)
    
    if token:
        return Token(access_token=token)
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid PIN"
        )


@router.post("/change", response_model=dict)
async def change_pin(change: PINChange):
    """Change existing PIN."""
    if not auth_module.is_pin_set():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No PIN is currently set. Use setup endpoint."
        )
    
    success = auth_module.change_pin(change.old_pin, change.new_pin)
    
    if success:
        return {"message": "PIN changed successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current PIN is incorrect"
        )
