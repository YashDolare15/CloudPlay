import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    aws_region: str = os.getenv("AWS_REGION", "eu-north-1")
    dynamodb_table: str = os.getenv("DYNAMODB_TABLE", "CloudPlayUsers")

    cognito_user_pool_id: str = os.getenv(
        "COGNITO_USER_POOL_ID",
        ""
    )

    cognito_app_client_id: str = os.getenv(
        "COGNITO_APP_CLIENT_ID",
        ""
    )

    host_secret: str = os.getenv(
        "CLOUDPLAY_HOST_SECRET",
        ""
    )

    cors_origins: tuple[str, ...] = tuple(
        x.strip()
        for x in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if x.strip()
    )


settings = Settings()