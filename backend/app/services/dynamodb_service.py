import boto3
from app.config import settings


class DynamoDBService:
    def __init__(self):
        # CloudPlayUsers table
        self.table = boto3.resource(
            "dynamodb",
            region_name=settings.aws_region,
        ).Table(settings.dynamodb_table)

        # CloudPlaySessions table
        self.sessions_table = boto3.resource(
            "dynamodb",
            region_name=settings.aws_region,
        ).Table("CloudPlaySessions")

    # =========================
    # USER METHODS
    # =========================

    def get_user(self, user_id):
        response = self.table.get_item(
            Key={"user_id": user_id}
        )
        return response.get("Item")

    def save_user_instance(self, user_id, instance_id, instance_type):
        self.table.put_item(
            Item={
                "user_id": user_id,
                "instance_id": instance_id,
                "instance_type": instance_type,
            }
        )

    # =========================
    # SESSION METHODS
    # =========================

    def get_session(self, host_id):
        response = self.sessions_table.get_item(
            Key={"host_id": host_id}
        )
        return response.get("Item")

    def create_session(self, session):
        self.sessions_table.put_item(
            Item=session
        )

    def end_session(self, host_id):
        self.sessions_table.update_item(
            Key={"host_id": host_id},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":status": "ended"
            }
        )