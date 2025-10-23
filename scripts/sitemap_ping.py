"""Utility script to notify search engines about the latest sitemap."""
from __future__ import annotations

import sys
import urllib.parse
from typing import Sequence

import requests

DEFAULT_SITEMAP_URL = "https://uninest.co.in/sitemap.xml"
PING_ENDPOINTS: Sequence[str] = (
    "https://www.google.com/ping?sitemap=",  # Google Search
    "https://www.bing.com/ping?sitemap=",  # Bing & partners (e.g. Yahoo)
)


def main(sitemap_url: str = DEFAULT_SITEMAP_URL) -> int:
    """Ping all configured endpoints with the given sitemap URL."""
    encoded_url = urllib.parse.quote(sitemap_url, safe="")

    success = True
    for endpoint_base in PING_ENDPOINTS:
        endpoint = f"{endpoint_base}{encoded_url}"
        response = requests.get(endpoint, timeout=10)
        print(f"Pinged {endpoint} -> {response.status_code}")
        if response.status_code != 200:
            success = False

    return 0 if success else 1


+if __name__ == "__main__":
+    sys.exit(main())
