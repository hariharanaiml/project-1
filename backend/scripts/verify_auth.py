"""
Authentication Verification Script
Tests:
- REGISTER
- LOGIN (correct password, wrong password, nonexistent user)
- JWT VALIDATION (missing JWT, invalid JWT, expired JWT)
- CURRENT USER (/api/v1/auth/me)
- LOGOUT
Rule: NEVER print credentials or tokens.
"""

import sys
import time
import json
import uuid
import urllib.request
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import jwt

BASE_URL = "http://127.0.0.1:8000/api/v1/auth"

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

def run_auth_tests():
    print("=== RUNNING AUTHENTICATION TESTS ===")
    test_id = uuid.uuid4().hex[:8]
    test_email = f"auth_test_{test_id}@roadsense.ai"
    test_password = f"P@ssw0rd123!{test_id}"
    
    # 1. REGISTER
    status, res = make_request("/register", method="POST", data={
        "email": test_email,
        "password": test_password,
        "full_name": "Auth Tester"
    })
    assert status in (200, 201), f"Register failed with status {status}: {res}"
    print("[PASS] Registration succeeded with status", status)
    
    # 2. LOGIN with correct password
    status, res = make_request("/login", method="POST", data={
        "email": test_email,
        "password": test_password
    })
    assert status == 200, f"Login failed with status {status}: {res}"
    data = res.get("data", {})
    token = data.get("access_token")
    assert token, f"No access_token returned in data: {res}"
    print("[PASS] Login with correct password succeeded, access_token present")
    
    # 3. LOGIN with wrong password
    status, res = make_request("/login", method="POST", data={
        "email": test_email,
        "password": "WrongPassword123!"
    })
    assert status in (400, 401), f"Wrong password expected 400/401, got {status}: {res}"
    print(f"[PASS] Login with wrong password failed safely (status={status})")
    
    # 4. LOGIN with nonexistent user
    status, res = make_request("/login", method="POST", data={
        "email": f"nonexistent_{uuid.uuid4().hex[:6]}@roadsense.ai",
        "password": "AnyPassword123!"
    })
    assert status in (400, 401, 404), f"Nonexistent user expected 400/401/404, got {status}: {res}"
    print(f"[PASS] Login with nonexistent user failed safely (status={status})")
    
    # 5. CURRENT USER (/me) with valid token
    status, res = make_request("/me", method="GET", token=token)
    assert status == 200, f"Get current user failed: status={status}, res={res}"
    user_data = res.get("data", {})
    assert user_data.get("email") == test_email, f"Returned user email mismatch: {res}"
    print("[PASS] /me with valid JWT succeeded, user verified")
    
    # 6. MISSING JWT
    status, res = make_request("/me", method="GET", token=None)
    assert status == 401, f"Missing JWT expected 401, got {status}: {res}"
    print("[PASS] Missing JWT rejected with 401 Unauthorized")
    
    # 7. INVALID JWT
    status, res = make_request("/me", method="GET", token="invalid.garbage.token")
    assert status == 401, f"Invalid JWT expected 401, got {status}: {res}"
    print("[PASS] Invalid JWT rejected with 401 Unauthorized")
    
    # 8. EXPIRED JWT
    # Create an expired token using standard jwt structure or dummy
    # HS256 dummy expired token
    expired_payload = {
        "sub": str(res.get("id")),
        "exp": int(time.time()) - 3600  # expired 1 hour ago
    }
    # Read backend secret or forge expired token
    from app.core.config import settings
    expired_token = jwt.encode(expired_payload, settings.secret_key, algorithm=settings.algorithm)
    status, res_exp = make_request("/me", method="GET", token=expired_token)
    assert status == 401, f"Expired JWT expected 401, got {status}: {res_exp}"
    print("[PASS] Expired JWT rejected with 401 Unauthorized")
    
    # 9. LOGOUT
    status, res = make_request("/logout", method="POST", token=token)
    assert status == 200, f"Logout failed: status={status}, res={res}"
    print("[PASS] Logout succeeded with status", status)
    
    print("=== ALL AUTHENTICATION TESTS PASSED ===")

if __name__ == "__main__":
    run_auth_tests()
