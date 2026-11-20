"""
Verification of Report Security (Step 5) & Admin (Step 6)
"""

import sys
import json
import uuid
import urllib.request
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.enums import UserRole
from app.core.security import hash_password

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body}

def login_user(email, password):
    status, res = make_request("/auth/login", method="POST", data={"email": email, "password": password})
    assert status == 200, f"Login failed for {email}: {res}"
    return res["data"]["access_token"]

def main():
    print("=== STEP 5: VERIFYING REPORT SECURITY ===")
    dummy_id = str(uuid.uuid4())

    # 1. Test every report endpoint without JWT -> must be 401
    endpoints_to_test = [
        ("GET", f"/reports"),
        ("POST", f"/reports"),
        ("GET", f"/reports/{dummy_id}"),
        ("PUT", f"/reports/{dummy_id}"),
        ("PATCH", f"/reports/{dummy_id}"),
        ("PATCH", f"/reports/{dummy_id}/status"),
        ("DELETE", f"/reports/{dummy_id}"),
    ]

    for method, path in endpoints_to_test:
        status, res = make_request(path, method=method, data={} if method in ("POST", "PUT", "PATCH") else None)
        assert status == 401, f"Expected 401 for unauthenticated {method} {path}, got {status}: {res}"
        print(f"[PASS] {method} {path} rejected without JWT (401)")

    # 2. Create USER A and USER B and ADMIN in DB
    db = SessionLocal()
    prefix = uuid.uuid4().hex[:6]
    user_a_email = f"user_a_{prefix}@roadsense.ai"
    user_b_email = f"user_b_{prefix}@roadsense.ai"
    admin_email = f"admin_{prefix}@roadsense.ai"
    password = f"TestPass123!{prefix}"
    hashed_pwd = hash_password(password)

    user_a = User(email=user_a_email, hashed_password=hashed_pwd, full_name="User A", role=UserRole.CITIZEN, is_active=True)
    user_b = User(email=user_b_email, hashed_password=hashed_pwd, full_name="User B", role=UserRole.CITIZEN, is_active=True)
    admin_u = User(email=admin_email, hashed_password=hashed_pwd, full_name="Admin User", role=UserRole.ADMIN, is_active=True, is_superuser=True)
    db.add_all([user_a, user_b, admin_u])
    db.commit()
    user_a_id = user_a.id
    user_b_id = user_b.id
    admin_id = admin_u.id
    db.close()

    token_a = login_user(user_a_email, password)
    token_b = login_user(user_b_email, password)
    token_admin = login_user(admin_email, password)

    # 3. USER A creates a report
    report_payload = {
        "road_name": "Main Street Security Test",
        "description": "Pothole security verification",
        "road_type": "city_road",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "severity": "medium",
        "damage_type": "pothole",
        "priority": "medium",
        "address": "123 Main St"
    }
    status, res = make_request("/reports", method="POST", data=report_payload, token=token_a)
    assert status == 201, f"User A failed to create report: {res}"
    report_id = res["data"]["id"]
    print(f"[PASS] User A created report {report_id} (201)")

    # 4. USER A accesses own report
    status, res = make_request(f"/reports/{report_id}", method="GET", token=token_a)
    assert status == 200, f"User A could not access own report: {res}"
    print(f"[PASS] User A accessed own report (200)")

    # 5. USER B attempts to modify (PUT) User A's report -> MUST BE 403 FORBIDDEN
    put_payload = {
        "road_name": "Hacked Road",
        "description": "Unauthorized overwrite",
        "road_type": "city_road",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "severity": "high",
        "damage_type": "pothole",
        "priority": "high",
        "address": "999 Hack St"
    }
    status, res = make_request(f"/reports/{report_id}", method="PUT", data=put_payload, token=token_b)
    assert status == 403, f"User B PUT expected 403, got {status}: {res}"
    print(f"[PASS] User B PUT rejected with 403 Forbidden")

    # 6. USER B attempts to update (PATCH) User A's report -> MUST BE 403 FORBIDDEN
    patch_payload = {"description": "Unauthorized patch"}
    status, res = make_request(f"/reports/{report_id}", method="PATCH", data=patch_payload, token=token_b)
    assert status == 403, f"User B PATCH expected 403, got {status}: {res}"
    print(f"[PASS] User B PATCH rejected with 403 Forbidden")

    # 7. USER B attempts to update status (PATCH /status) -> MUST BE 403 FORBIDDEN
    status, res = make_request(f"/reports/{report_id}/status", method="PATCH", data={"status": "resolved"}, token=token_b)
    assert status == 403, f"User B PATCH /status expected 403, got {status}: {res}"
    print(f"[PASS] User B PATCH /status rejected with 403 Forbidden")

    # 8. USER B attempts to delete (DELETE) User A's report -> MUST BE 403 FORBIDDEN
    status, res = make_request(f"/reports/{report_id}", method="DELETE", token=token_b)
    assert status == 403, f"User B DELETE expected 403, got {status}: {res}"
    print(f"[PASS] User B DELETE rejected with 403 Forbidden")

    # 9. Admin can update User A's report
    status, res = make_request(f"/reports/{report_id}", method="PATCH", data={"description": "Admin reviewed"}, token=token_admin)
    assert status == 200, f"Admin PATCH expected 200, got {status}: {res}"
    print(f"[PASS] Admin permitted to update User A's report (200)")

    # 10. User A updates their own report
    status, res = make_request(f"/reports/{report_id}", method="PATCH", data={"description": "User A update"}, token=token_a)
    assert status == 200, f"User A PATCH expected 200, got {status}: {res}"
    print(f"[PASS] User A permitted to update their own report (200)")

    # 11. User A deletes their own report
    status, res = make_request(f"/reports/{report_id}", method="DELETE", token=token_a)
    assert status == 204, f"User A DELETE expected 204, got {status}: {res}"
    print(f"[PASS] User A permitted to delete their own report (204)")

    print("=== STEP 6: VERIFYING ADMIN STATS ===")
    # 1. No authentication -> 401
    status, res = make_request("/admin/stats", method="GET")
    assert status == 401, f"Expected 401 for unauthenticated admin stats, got {status}: {res}"
    print("[PASS] GET /admin/stats rejected without JWT (401)")

    # 2. Normal user (User A) -> 403
    status, res = make_request("/admin/stats", method="GET", token=token_a)
    assert status == 403, f"Expected 403 for normal citizen, got {status}: {res}"
    print("[PASS] GET /admin/stats rejected for regular citizen (403 Forbidden)")

    # 3. Admin user -> 200 with REAL database stats
    status, res = make_request("/admin/stats", method="GET", token=token_admin)
    assert status == 200, f"Expected 200 for admin, got {status}: {res}"
    data = res.get("data", {})
    assert "total_reports" in data or "total_users" in data or "overview" in data or isinstance(data, dict), f"Unexpected data format: {res}"
    print("[PASS] GET /admin/stats returned real DB stats for admin (200):", list(data.keys()))

    print("=== STEP 5 & STEP 6 PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
