from fastapi import APIRouter, Depends
from app.auth import get_current_user

router = APIRouter()

CLOUDPLAY_GAMES = [
    {
        "id": "chess",
        "name": "CloudPlay Chess",
        "category": "Strategy",
        "status": "available",
    },
    {
        "id": "racing-demo",
        "name": "CloudPlay Racing Demo",
        "category": "Racing",
        "status": "planned",
    },
]

@router.get("/")
def get_games(current_user=Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "games": CLOUDPLAY_GAMES,
    }