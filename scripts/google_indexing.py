"""Submit URL updates to the Google Indexing API."""
from __future__ import annotations

from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/indexing"]
SERVICE_ACCOUNT_FILE = Path(__file__).resolve().parent / "service-account.json"
TARGET_URLS = [
    "https://uninest.co.in/",
]


def main() -> None:
    if not SERVICE_ACCOUNT_FILE.exists():
        raise FileNotFoundError(
            "Missing service-account.json in scripts/. Download from Google Cloud console"
        )

    creds = service_account.Credentials.from_service_account_file(
        str(SERVICE_ACCOUNT_FILE), scopes=SCOPES
    )
    service = build("indexing", "v3", credentials=creds)

    for url in TARGET_URLS:
        body = {"url": url, "type": "URL_UPDATED"}
        response = service.urlNotifications().publish(body=body).execute()
        print(f"Published indexing notification for {url}: {response}")


if __name__ == "__main__":
    main()
