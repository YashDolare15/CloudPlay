from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user
from app.services.ec2_service import EC2Service

router = APIRouter()
ec2_service = EC2Service()

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
    }

@router.get("/status")
def get_status(current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]

    result = ec2_service.get_user_instance_status(user_id)

    if result is None:
        return {
            "user_id": user_id,
            "username": current_user["username"],
            "status": "not_configured",
            "message": "No EC2 instance is mapped to this user.",
        }

    return {
        **result,
        "username": current_user["username"],
    }

@router.post("/start")
def start_cloud_pc(current_user=Depends(get_current_user)):
    result = ec2_service.start_user_instance(
        current_user["user_id"]
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="No EC2 instance is mapped to this user.",
        )

    return result

@router.post("/stop")
def stop_cloud_pc(current_user=Depends(get_current_user)):
    result = ec2_service.stop_user_instance(
        current_user["user_id"]
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="No EC2 instance is mapped to this user.",
        )

    return result