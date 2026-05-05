import urllib.request
import urllib.parse
import json
import ssl
import os

SUPABASE_URL = "https://dfkgefoqodjccrrqmqis.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

ctx = ssl.create_default_context()

def request(method, path, data=None, params=None):
    url = SUPABASE_URL + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            return json.loads(resp.read()) if resp.read.__name__ else resp.read()
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()}

def get(path, params=None):
    url = SUPABASE_URL + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS, method="GET")
    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read())

def patch(path, data, params=None):
    url = SUPABASE_URL + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=HEADERS, method="PATCH")
    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read())

def post(path, data):
    url = SUPABASE_URL + path
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=HEADERS, method="POST")
    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read())

# Step 1: Get all products
print("=== ALL PRODUCTS ===")
products = get("/rest/v1/products", None)
# Build URL manually with proper encoding
url = SUPABASE_URL + "/rest/v1/products?select=id,name,category,status,parent_product_id,seller_id,price,total_seats&order=id.asc&limit=100"
req = urllib.request.Request(url, headers=HEADERS, method="GET")
with urllib.request.urlopen(req, context=ctx) as resp:
    products = json.loads(resp.read())
for p in products:
    print(f"  ID {p['id']}: [{p['status']}] {p['category']} - {p['name'][:40]}")

# Step 2: Fix all pending products to active
print("\n=== FIXING PENDING PRODUCTS ===")
pending = [p for p in products if p['status'] == 'pending']
print(f"Found {len(pending)} pending products")
for p in pending:
    print(f"  Activating ID {p['id']}: {p['name'][:40]}")
    req = urllib.request.Request(
        SUPABASE_URL + f"/rest/v1/products?id=eq.{p['id']}",
        data=json.dumps({"status": "active"}).encode(),
        headers=HEADERS,
        method="PATCH"
    )
    with urllib.request.urlopen(req, context=ctx) as resp:
        print(f"  -> Done ({resp.status})")

# Step 3: Check libraries that need seat products
print("\n=== CHECKING LIBRARY SEATS ===")
libraries = [p for p in products if p['category'] == 'Library']
seats = [p for p in products if p['category'] == 'Library Seat']
print(f"Libraries: {len(libraries)}, Existing seats: {len(seats)}")

for lib in libraries:
    lib_seats = [s for s in seats if s['parent_product_id'] == lib['id']]
    print(f"  Library '{lib['name']}' (ID {lib['id']}): {len(lib_seats)} seats")
    
    if len(lib_seats) == 0:
        # Create 30 seats for libraries with no seats
        num_seats = int(lib.get('total_seats', 30) or 30)
        print(f"  -> Creating {num_seats} seats...")
        seat_records = []
        for i in range(1, num_seats + 1):
            seat_records.append({
                "name": f"Seat {i}",
                "category": "Library Seat",
                "price": lib['price'] if lib.get('price') else 50,
                "seller_id": lib['seller_id'],
                "parent_product_id": lib['id'],
                "description": f"Seat {i} at {lib['name']}",
                "status": "active"
            })
        # Insert in batches of 10
        for i in range(0, len(seat_records), 10):
            batch = seat_records[i:i+10]
            req = urllib.request.Request(
                SUPABASE_URL + "/rest/v1/products",
                data=json.dumps(batch).encode(),
                headers=HEADERS,
                method="POST"
            )
            with urllib.request.urlopen(req, context=ctx) as resp:
                print(f"  -> Inserted batch {i//10 + 1} ({resp.status})")

print("\n=== DONE ===")
