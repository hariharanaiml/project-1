"""
Master E2E and Negative Testing Verification Script (Steps 25 & 26)
"""

import sys
import io
import json
import time
import uuid
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
import jwt

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_req(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body}

def multipart_post(endpoint, fields=None, files=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    body = bytearray()
    if fields:
        for name, value in fields.items():
            body.extend(f"--{boundary}\r\n".encode("utf-8"))
            body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"))
            body.extend(f"{value}\r\n".encode("utf-8"))
    if files:
        for name, (filename, file_bytes, content_type) in files.items():
            body.extend(f"--{boundary}\r\n".encode("utf-8"))
            body.extend(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode("utf-8"))
            body.extend(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
            body.extend(file_bytes)
            body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=bytes(body), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw}

def test_complete_e2e_flow():
    print("\n========================================================")
    print("STEP 25: COMPLETE REAL-WORLD E2E FLOW")
    print("========================================================")

    prefix = uuid.uuid4().hex[:8]
    user_email = f"e2e_citizen_{prefix}@roadsense.ai"
    user_pwd = f"StrongP@ss123_{prefix}"
    user_name = f"E2E Citizen {prefix[:4]}"

    # 1. REGISTER
    print("1. REGISTER...")
    status, res = make_req("/auth/register", method="POST", data={
        "email": user_email,
        "password": user_pwd,
        "full_name": user_name
    })
    assert status == 201, f"Registration failed: {status} {res}"
    print(f"   [PASS] User registered successfully")

    # 2. LOGIN
    print("2. LOGIN...")
    status, res = make_req("/auth/login", method="POST", data={
        "email": user_email,
        "password": user_pwd
    })
    assert status == 200, f"Login failed: {status} {res}"
    token = res["data"]["access_token"]
    user_id = res["data"]["user"]["id"]
    print(f"   [PASS] Login successful, JWT obtained")

    # 3. DASHBOARD
    print("3. DASHBOARD OVERVIEW...")
    status, dash_res = make_req("/dashboard/overview", token=token)
    assert status == 200, f"Dashboard overview failed: {status} {dash_res}"
    print(f"   [PASS] Dashboard loaded successfully")

    # 4. CAPTURE ROAD IMAGE & GPS
    gps_lat = 13.0827
    gps_lng = 80.2707
    road_name = f"E2E Anna Salai Expressway {prefix[:4]}"
    road_img_path = Path("uploads/test_pothole_road.jpg")
    if not road_img_path.exists():
        road_img_path = Path("uploads/test_road.jpg")
    with open(road_img_path, "rb") as f:
        img_bytes = f.read()
    print(f"   [PASS] Road image captured ({len(img_bytes)} bytes) at GPS ({gps_lat}, {gps_lng})")

    # 5. UPLOAD
    print("4. UPLOAD IMAGE...")
    status, up_res = multipart_post("/upload", files={"file": (road_img_path.name, img_bytes, "image/jpeg")}, token=token)
    assert status == 201, f"Upload failed: {status} {up_res}"
    uploaded_filename = up_res["data"]["filename"]
    print(f"   [PASS] Image uploaded as {uploaded_filename}")

    # 6. SAVE REPORT
    print("5. CREATE REPORT IN DATABASE...")
    report_payload = {
        "road_name": road_name,
        "description": "E2E Inspection of road surface with potential pothole damage",
        "road_type": "highway",
        "latitude": gps_lat,
        "longitude": gps_lng,
        "address": "Anna Salai, Chennai, TN",
        "image_path": f"uploads/{uploaded_filename}",
        "severity": "medium",
        "damage_type": "pothole",
        "priority": "high"
    }
    status, rep_res = make_req("/reports", method="POST", data=report_payload, token=token)
    assert status == 201, f"Report creation failed: {status} {rep_res}"
    report_id = rep_res["data"]["id"]
    report_num = rep_res["data"]["report_number"]
    print(f"   [PASS] Report created: {report_id} ({report_num})")

    # 7. REAL YOLO INFERENCE & PREDICT
    print("6. REAL YOLO INFERENCE & PERSISTENCE...")
    status, ai_res = multipart_post(
        "/ai/predict",
        fields={"report_id": report_id},
        files={"file": (road_img_path.name, img_bytes, "image/jpeg")},
        token=token
    )
    assert status == 200, f"AI Predict failed: {status} {ai_res}"
    assert ai_res.get("success") is True, f"AI success false: {ai_res}"
    print(f"   [PASS] Real YOLO inference complete: {ai_res.get('detection_count', 0)} detection(s)")
    print(f"          Severity: {ai_res.get('severity')} | Priority: {ai_res.get('priority')}")
    print(f"          Estimated Repair Cost: {ai_res.get('cost_range')}")
    print(f"          Recommendation: {ai_res.get('recommendation')}")
    print(f"          Annotated Image: {ai_res.get('annotated_image_url')}")

    # 8. VERIFY DATABASE & HISTORY
    print("7. VERIFY IN DATABASE & HISTORY...")
    status, get_rep = make_req(f"/reports/{report_id}", token=token)
    assert status == 200, f"Get report failed: {status} {get_rep}"
    assert get_rep["data"]["ai_processed"] is True, "ai_processed not updated on Report"
    print(f"   [PASS] Report verified in database: ai_processed=True, status={get_rep['data']['status']}")

    status, hist_res = make_req("/reports?page=1&page_size=20", token=token)
    assert status == 200, f"List reports failed: {status} {hist_res}"
    found = any(r["id"] == report_id for r in hist_res["data"])
    assert found, "Report not in reports list"
    print(f"   [PASS] Report present in report history list")

    # 9. VERIFY MAP
    print("8. VERIFY IN MAP INSPECTIONS...")
    status, map_res = make_req("/dashboard/map-inspections", token=token)
    assert status == 200, f"Map inspections failed: {status} {map_res}"
    markers = map_res.get("data", {}).get("items", [])
    marker = next((m for m in markers if m.get("report_id") == report_id), None)
    assert marker is not None, "Report marker missing from map data"
    assert marker.get("latitude") == gps_lat and marker.get("longitude") == gps_lng
    print(f"   [PASS] Map marker verified with GPS ({marker['latitude']}, {marker['longitude']})")

    # 10. VERIFY ANALYTICS
    print("9. VERIFY IN ANALYTICS...")
    status, analytics_res = make_req("/analytics/overview", token=token)
    assert status == 200, f"Analytics overview failed: {status} {analytics_res}"
    print(f"   [PASS] Analytics overview loaded successfully")

    # 11. VERIFY ADMIN STATS
    print("10. VERIFY ADMIN ACCESS & STATS...")
    # Admin user
    admin_email = f"e2e_admin_{prefix}@roadsense.ai"
    from app.db.session import SessionLocal
    from app.models.user import User
    from app.models.enums import UserRole
    from app.core.security import hash_password
    db = SessionLocal()
    admin_user = User(
        email=admin_email,
        hashed_password=hash_password(user_pwd),
        full_name="E2E Admin",
        role=UserRole.ADMIN,
        is_active=True,
        is_superuser=True
    )
    db.add(admin_user)
    db.commit()
    db.close()

    status, adm_login = make_req("/auth/login", method="POST", data={"email": admin_email, "password": user_pwd})
    assert status == 200, f"Admin login failed: {adm_login}"
    admin_token = adm_login["data"]["access_token"]

    status, admin_stats = make_req("/admin/stats", token=admin_token)
    assert status == 200, f"Admin stats failed: {admin_stats}"
    assert admin_stats["data"]["total_reports"] > 0, "Admin stats reports count is 0"
    print(f"   [PASS] Admin stats verified: {admin_stats['data']}")

    # 12. LOGOUT
    print("11. LOGOUT...")
    status, logout_res = make_req("/auth/logout", method="POST", token=token)
    assert status == 200, f"Logout failed: {logout_res}"
    print(f"   [PASS] Logged out successfully")
    print("========================================================")
    print("STEP 25: COMPLETE REAL-WORLD E2E FLOW PASSED 100%")
    print("========================================================\n")

def test_negative_cases():
    print("========================================================")
    print("STEP 26: NEGATIVE TESTING")
    print("========================================================")

    # 1. Wrong password
    print("1. Testing wrong password...")
    status, res = make_req("/auth/login", method="POST", data={"email": "nobody@roadsense.ai", "password": "WrongPassword!"})
    assert status in (400, 401), f"Expected 401, got {status}: {res}"
    print(f"   [PASS] Wrong password rejected (status={status})")

    # 2. Missing JWT
    print("2. Testing missing JWT...")
    status, res = make_req("/reports")
    assert status == 401, f"Expected 401, got {status}: {res}"
    print(f"   [PASS] Missing JWT rejected (401)")

    # 3. Invalid JWT
    print("3. Testing invalid JWT...")
    status, res = make_req("/reports", token="invalid.token.here")
    assert status == 401, f"Expected 401, got {status}: {res}"
    print(f"   [PASS] Invalid JWT rejected (401)")

    # 4. Expired JWT
    print("4. Testing expired JWT...")
    expired_token = jwt.encode(
        {"sub": str(uuid.uuid4()), "type": "access", "exp": int(time.time()) - 3600},
        settings.secret_key,
        algorithm=settings.algorithm
    )
    status, res = make_req("/reports", token=expired_token)
    assert status == 401, f"Expected 401, got {status}: {res}"
    print(f"   [PASS] Expired JWT rejected (401)")

    # 5. Unauthorized and cross-user report access
    print("5. Testing cross-user report modification...")
    prefix = uuid.uuid4().hex[:6]
    # User 1
    u1_email = f"user1_{prefix}@roadsense.ai"
    u2_email = f"user2_{prefix}@roadsense.ai"
    pwd = f"Pass123_{prefix}"
    make_req("/auth/register", method="POST", data={"email": u1_email, "password": pwd, "full_name": "User 1"})
    make_req("/auth/register", method="POST", data={"email": u2_email, "password": pwd, "full_name": "User 2"})
    _, l1 = make_req("/auth/login", method="POST", data={"email": u1_email, "password": pwd})
    _, l2 = make_req("/auth/login", method="POST", data={"email": u2_email, "password": pwd})
    t1 = l1["data"]["access_token"]
    t2 = l2["data"]["access_token"]

    _, rep = make_req("/reports", method="POST", data={
        "road_name": "U1 Road",
        "description": "Valid road damage description for cross-user test",
        "road_type": "city_road"
    }, token=t1)
    rep_id = rep["data"]["id"]

    # U2 tries to delete U1's report -> 403
    status, res = make_req(f"/reports/{rep_id}", method="DELETE", token=t2)
    assert status == 403, f"Expected 403 for cross-user delete, got {status}: {res}"
    print(f"   [PASS] Cross-user deletion rejected (403 Forbidden)")

    # U2 tries to update U1's report -> 403
    status, res = make_req(f"/reports/{rep_id}", method="PATCH", data={"description": "Unauthorized cross-user update attempt"}, token=t2)
    assert status == 403, f"Expected 403 for cross-user update, got {status}: {res}"
    print(f"   [PASS] Cross-user modification rejected (403 Forbidden)")

    # 6. Invalid report ID (non-existent UUID)
    print("6. Testing invalid report ID...")
    bad_id = str(uuid.uuid4())
    status, res = make_req(f"/reports/{bad_id}", token=t1)
    assert status == 404, f"Expected 404 for non-existent report, got {status}: {res}"
    print(f"   [PASS] Non-existent report returned 404 Not Found")

    # 7. Invalid image format (e.g. text or binary)
    print("7. Testing invalid image format on /upload...")
    status, res = multipart_post("/upload", files={"file": ("hack.sh", b"#!/bin/bash\nexit 0", "application/x-sh")}, token=t1)
    assert status in (400, 422), f"Expected 422 for invalid mime, got {status}: {res}"
    print(f"   [PASS] Shell script upload rejected ({status})")

    # 8. Oversized image (>10MB)
    print("8. Testing oversized image (>10MB)...")
    oversized = b"A" * (10 * 1024 * 1024 + 500)
    status, res = multipart_post("/upload", files={"file": ("big.jpg", oversized, "image/jpeg")}, token=t1)
    assert status in (400, 413, 422), f"Expected 413/422, got {status}: {res}"
    print(f"   [PASS] Oversized upload rejected ({status})")

    # 9. Corrupt image bytes
    print("9. Testing corrupt image bytes on /ai/predict...")
    status, res = multipart_post("/ai/predict", files={"file": ("broken.png", b"\x89PNG\r\n\x1a\ncorruptdatahere", "image/png")}, token=t1)
    assert status in (400, 422), f"Expected 422, got {status}: {res}"
    print(f"   [PASS] Corrupt image on /ai/predict rejected ({status})")

    # Clean up user 1 report
    make_req(f"/reports/{rep_id}", method="DELETE", token=t1)

    print("========================================================")
    print("STEP 26: NEGATIVE TESTING PASSED 100%")
    print("========================================================\n")

if __name__ == "__main__":
    test_complete_e2e_flow()
    test_negative_cases()
