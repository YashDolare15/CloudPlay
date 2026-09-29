from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException

from app.config import settings
from app.services.dynamodb_service import DynamoDBService


router = APIRouter(
    prefix="/api/host",
    tags=["Host"]
)

db = DynamoDBService()

HOST_ID = "gaming-laptop-01"


@router.get("/session")
def get_host_session(
    x_cloudplay_host_secret: str | None = Header(default=None)
):
    # Verify host secret
    if x_cloudplay_host_secret != settings.host_secret:
        raise HTTPException(
            status_code=401,
            detail="Invalid host secret."
        )

    # Get current session
    session = db.get_session(HOST_ID)

    if not session:
        return {
            "active": False,
            "session": None
        }

    expires_at = datetime.fromisoformat(
        session["expires_at"]
    )

    # Check whether session is still active
    active = (
        session.get("status") == "active"
        and expires_at > datetime.now(timezone.utc)
    )

    return {
        "active": active,
        "session": session
    }