import os
import time
import base64
import requests
from dotenv import load_dotenv
import urllib3


load_dotenv()

# Disable warnings caused by Sunshine's self-signed certificate
urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)


BACKEND_URL = os.getenv(
    "CLOUDPLAY_BACKEND_URL",
    "http://127.0.0.1:8000"
)

HOST_SECRET = os.getenv(
    "CLOUDPLAY_HOST_SECRET",
    ""
)

SUNSHINE_URL = os.getenv(
    "SUNSHINE_URL",
    "https://localhost:47990"
)

SUNSHINE_USERNAME = os.getenv(
    "SUNSHINE_USERNAME",
    ""
)

SUNSHINE_PASSWORD = os.getenv(
    "SUNSHINE_PASSWORD",
    ""
)

CHECK_INTERVAL = 5

was_active = False


def get_session():
    """Get the current gaming session from CloudPlay backend."""

    response = requests.get(
        f"{BACKEND_URL}/api/host/session",
        headers={
            "X-CloudPlay-Host-Secret": HOST_SECRET
        },
        timeout=10
    )

    response.raise_for_status()

    return response.json()


def close_sunshine_application():
    """Close the currently running Sunshine application."""

    print("Closing Sunshine application...")

    response = requests.post(
        f"{SUNSHINE_URL}/api/apps/close",
        auth=(
            SUNSHINE_USERNAME,
            SUNSHINE_PASSWORD
        ),
        verify=False,
        timeout=10
    )

    response.raise_for_status()

    print("Sunshine application closed successfully.")


def main():
    global was_active

    print("===================================")
    print(" CloudPlay Host Agent")
    print("===================================")
    print(f"Backend: {BACKEND_URL}")
    print(f"Sunshine: {SUNSHINE_URL}")
    print(f"Check interval: {CHECK_INTERVAL} seconds")
    print()

    while True:
        try:
            data = get_session()

            active = data.get("active", False)
            session = data.get("session")

            if active:
                if not was_active:
                    print("CloudPlay session started.")

                was_active = True

                if session:
                    print(
                        f"Session expires at: "
                        f"{session.get('expires_at')}"
                    )

            else:
                if was_active:
                    print("CloudPlay session expired or ended.")

                    try:
                        close_sunshine_application()
                    except Exception as e:
                        print(
                            f"Failed to close Sunshine: {e}"
                        )

                    was_active = False

                else:
                    print("No active CloudPlay session.")

            time.sleep(CHECK_INTERVAL)

        except requests.RequestException as e:
            print(f"Connection error: {e}")
            time.sleep(CHECK_INTERVAL)

        except KeyboardInterrupt:
            print("\nHost Agent stopped.")
            break

        except Exception as e:
            print(f"Unexpected error: {e}")
            time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()