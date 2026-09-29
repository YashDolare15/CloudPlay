import boto3
from botocore.exceptions import ClientError

from app.config import settings
from app.services.dynamodb_service import DynamoDBService

class EC2Service:
    def __init__(self):
        self.ec2 = boto3.client("ec2", region_name=settings.aws_region)
        self.db = DynamoDBService()

    def get_user_instance_id(self, user_id):
        user = self.db.get_user(user_id)
        return user.get("instance_id") if user else None

    def get_user_instance_status(self, user_id):
        user = self.db.get_user(user_id)

        if not user:
            return None

        instance_id = user["instance_id"]

        try:
            response = self.ec2.describe_instances(
                InstanceIds=[instance_id]
            )
            reservations = response.get("Reservations", [])

            if not reservations or not reservations[0].get("Instances"):
                return {
                    "status": "error",
                    "message": "EC2 instance not found",
                }

            instance = reservations[0]["Instances"][0]

            return {
                "user_id": user_id,
                "instance_id": instance_id,
                "instance_type": instance.get(
                    "InstanceType",
                    user.get("instance_type"),
                ),
                "status": instance["State"]["Name"],
            }

        except ClientError as exc:
            return {
                "status": "error",
                "message": str(exc),
            }

    def start_user_instance(self, user_id):
        instance_id = self.get_user_instance_id(user_id)

        if not instance_id:
            return None

        self.ec2.start_instances(InstanceIds=[instance_id])

        return {
            "user_id": user_id,
            "instance_id": instance_id,
            "status": "starting",
        }

    def stop_user_instance(self, user_id):
        instance_id = self.get_user_instance_id(user_id)

        if not instance_id:
            return None

        self.ec2.stop_instances(InstanceIds=[instance_id])

        return {
            "user_id": user_id,
            "instance_id": instance_id,
            "status": "stopping",
        }