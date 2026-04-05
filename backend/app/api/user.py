from fastapi import APIRouter, HTTPException, Body, Request
from app.core.limiter import limiter
from app.services.profile_service import profile_service
from app.db.mongodb import mongo_client
from app.core.config import settings
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# ── IMPORTANT: Specific routes MUST come before wildcard routes ──────────────
# FastAPI matches routes in declaration order. If /{auth0_id} is first,
# it would swallow /tutor/{auth0_id} and /sync before they can match.

@router.get("/tutor/{auth0_id}")
@limiter.limit("20/minute")
async def get_tutor_profile(request: Request, auth0_id: str):
    tutor = await profile_service.get_tutor_by_auth0(auth0_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    return tutor

@router.post("/sync")
@limiter.limit("20/minute")  # Raised from 5/min — syncUser is called on every login/page load
async def sync_user_profile(request: Request, data: Dict[str, Any]):
    """
    Upsert user data (typically called on login/signup).
    This is idempotent — safe to call on every login.
    """
    auth0_id = data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=400, detail="Missing 'sub' (Auth0 ID)")

    email = data.get("email")
    update_data = {
        "fullName": data.get("fullName", data.get("name")),
        "photoUrl": data.get("photoUrl", data.get("picture")),
        "email": email,
        "auth0Id": auth0_id,  # Backwards compatibility
        "sub": auth0_id       # Primary ID
    }

    # Auto-assign Admin role if email is in the list
    if email and email in settings.ADMIN_EMAILS:
        update_data["role"] = "admin"

    # Filter out None values
    update_data = {k: v for k, v in update_data.items() if v is not None}

    try:
        await mongo_client.db.User.update_one(
            {"sub": auth0_id},
            {"$set": update_data},
            upsert=True
        )
        logger.info(f"[User API] Synced user: {auth0_id}")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{auth0_id}")
@limiter.limit("20/minute")
async def update_user_profile(request: Request, auth0_id: str, data: Dict[str, Any]):
    """
    Update user profile data (e.g. from Onboarding).
    """
    try:
        # Filter out immutable fields
        update_data = {k: v for k, v in data.items() if k not in ["_id", "auth0Id", "sub"]}

        await mongo_client.db.User.update_one(
            {"sub": auth0_id},
            {"$set": update_data},
            upsert=True
        )
        logger.info(f"[User API] Updated profile for: {auth0_id}")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Wildcard route LAST ───────────────────────────────────────────────────────
@router.get("/{auth0_id}")
@limiter.limit("20/minute")
async def get_user_profile(request: Request, auth0_id: str):
    logger.info(f"[User API] Fetching profile for ID: {auth0_id}")
    user = await profile_service.get_user_profile(auth0_id)
    if not user:
        logger.warning(f"[User API] Profile NOT FOUND in DB for ID: {auth0_id}")
        raise HTTPException(status_code=404, detail="User not found")
    return user
