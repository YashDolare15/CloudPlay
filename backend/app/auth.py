from functools import lru_cache
from typing import Any

import jwt
import requests

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings


security = HTTPBearer()


def get_jwks_url() -> str:
    return (
        f"https://cognito-idp.{settings.aws_region}.amazonaws.com/"
        f"{settings.cognito_user_pool_id}"
        f"/.well-known/jwks.json"
    )


def get_issuer() -> str:
    return (
        f"https://cognito-idp.{settings.aws_region}.amazonaws.com/"
        f"{settings.cognito_user_pool_id}"
    )


@lru_cache(maxsize=1)
def get_jwks() -> dict[str, Any]:
    url = get_jwks_url()

    print("Cognito JWKS URL:", url)

    response = requests.get(
        url,
        timeout=10
    )

    response.raise_for_status()

    return response.json()


def verify_cognito_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
):
    token = credentials.credentials

    try:
        # -----------------------------------------
        # Read JWT header
        # -----------------------------------------

        header = jwt.get_unverified_header(token)

        kid = header.get("kid")

        if not kid:
            raise ValueError(
                "JWT signing key ID (kid) is missing"
            )

        # -----------------------------------------
        # Get Cognito public keys
        # -----------------------------------------

        jwks = get_jwks()

        key_data = next(
            (
                key
                for key in jwks["keys"]
                if key["kid"] == kid
            ),
            None,
        )

        if key_data is None:
            raise ValueError(
                "Cognito signing key not found"
            )

        # -----------------------------------------
        # Build public key
        # -----------------------------------------

        public_key = (
            jwt.algorithms.RSAAlgorithm.from_jwk(
                key_data
            )
        )

        # -----------------------------------------
        # Decode and verify token
        # -----------------------------------------

        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=get_issuer(),
            options={
                "verify_aud": False
            },
        )

        # -----------------------------------------
        # Verify token type
        # -----------------------------------------

        if claims.get("token_use") != "access":
            raise ValueError(
                "Expected Cognito access token"
            )

        # -----------------------------------------
        # Verify app client
        # -----------------------------------------

        if (
            claims.get("client_id")
            != settings.cognito_app_client_id
        ):
            raise ValueError(
                "Invalid Cognito app client"
            )

        return claims

    except Exception as exc:

        print(
            "Cognito token verification failed:",
            repr(exc)
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Cognito token: {exc}",
        )


def get_current_user(
    claims: dict[str, Any] = Depends(
        verify_cognito_access_token
    ),
):
    user_id = claims.get("sub")

    username = (
        claims.get("username")
        or claims.get("cognito:username")
    )

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Cognito subject missing"
        )

    return {
        "user_id": user_id,
        "username": username,
        "claims": claims,
    }