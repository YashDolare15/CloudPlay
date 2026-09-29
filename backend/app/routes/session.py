from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user
from app.services.dynamodb_service import DynamoDBService


router = APIRouter(prefix="/api/session", tags=["Session"])

db = DynamoDBService()

HOST_ID = "gaming-laptop-01"
SESSION_DURATION_MINUTES = 60


@router.post("/start")
def start_session(current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]

    existing_session = db.get_session(HOST_ID)

    if existing_session:
        expires_at = datetime.fromisoformat(
            existing_session["expires_at"]
        )

        if (
            existing_session.get("status") == "active"
            and expires_at > datetime.now(timezone.utc)
        ):
            if existing_session.get("user_id") == user_id:
                return existing_session

            raise HTTPException(
                status_code=409,
                detail="Gaming laptop is currently in use.",
            )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=SESSION_DURATION_MINUTES)

    session = {
        "host_id": HOST_ID,
        "user_id": user_id,
        "status": "active",
        "started_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }

    db.create_session(session)

    return session


@router.get("/me")
def get_my_session(current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]

    session = db.get_session(HOST_ID)

    if not session or session.get("user_id") != user_id:
        return {
            "active": False,
            "session": None,
        }

    expires_at = datetime.fromisoformat(
        session["expires_at"]
    )

    if (
        session.get("status") != "active"
        or expires_at <= datetime.now(timezone.utc)
    ):
        return {
            "active": False,
            "session": session,
        }

    return {
        "active": True,
        "session": session,
    }


@router.post("/end")
def end_my_session(current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]

    session = db.get_session(HOST_ID)

    if not session:
        return {
            "message": "No active session.",
        }

    if session.get("user_id") != user_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot end another user's session.",
        )

    db.end_session(HOST_ID)

    return {
        "message": "Session ended successfully.",
    }