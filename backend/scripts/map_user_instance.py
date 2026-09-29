import argparse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.services.dynamodb_service import DynamoDBService

parser = argparse.ArgumentParser()
parser.add_argument("--user-sub", required=True)
parser.add_argument("--instance-id", required=True)
parser.add_argument("--instance-type", required=True)

args = parser.parse_args()

db = DynamoDBService()

db.save_user_instance(
    args.user_sub,
    args.instance_id,
    args.instance_type,
)

print("User -> EC2 mapping saved.")