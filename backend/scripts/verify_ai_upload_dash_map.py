"""
Verification Script for Steps 7, 8, 9, 10, 11:
- Real AI / YOLO (Step 7)
- AI Database Persistence (Step 8)
- Upload Security (Step 9)
- Dashboard (Step 10)
- Map (Step 11)
"""

import os
import sys
import io
import json
import uuid
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.report import Report
from app.models.ai_analysis import AIAnalysis
from app.models.enums import UserRole
from app.core.security import hash_password
from ultralytics import YOLO

BASE_URL = "http://127.0.0.1:8000/api/v1"

def multipart_post(url, fields=None, files=None, token=None):
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

def get_json(url, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw}

def main():
    print("=== STEP 7: REAL AI / YOLO VERIFICATION ===")
    model_path = Path("models/best.pt")
    assert model_path.exists(), f"Model file not found at {model_path}"
    model = YOLO(str(model_path))
    assert model is not None, "Failed to load YOLO model"
    
    expected_classes = [
        "alligator crack",
        "lane line blur",
        "longitudinal crack",
        "manhole cover",
        "patchy road section",
        "pothole",
        "transverse crack"
    ]
    model_classes = list(model.names.values())
    print(f"Model classes: {model_classes}")
    for exp in expected_classes:
        assert exp in model_classes, f"Missing class: {exp}"
    print("[PASS] Model contains all 7 expected road damage classes.")

    test_img_path = Path("uploads/test_pothole_road.jpg")
    if not test_img_path.exists():
        test_img_path = Path("uploads/test_road.jpg")
    print(f"Running inference on {test_img_path}...")
    yolo_res = model.predict(source=str(test_img_path), conf=0.25, imgsz=640, device="cpu")
    assert len(yolo_res) > 0, "No results from model predict"
    print(f"[PASS] Real YOLO inference completed successfully, found {len(yolo_res[0].boxes)} box(es)")

    print("\n=== STEP 9: UPLOAD SECURITY VERIFICATION ===")
    upload_url = f"{BASE_URL}/upload"
    
    # 1. Valid JPEG
    img_byte_arr = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    img.save(img_byte_arr, format="JPEG")
    valid_jpeg = img_byte_arr.getvalue()
    status, res = multipart_post(upload_url, files={"file": ("test.jpg", valid_jpeg, "image/jpeg")})
    assert status == 201, f"Valid JPEG failed: {status}, {res}"
    print("[PASS] Valid JPEG upload succeeded (201)")

    # 2. Valid PNG
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    valid_png = img_byte_arr.getvalue()
    status, res = multipart_post(upload_url, files={"file": ("test.png", valid_png, "image/png")})
    assert status == 201, f"Valid PNG upload succeeded (201)"
    print("[PASS] Valid PNG upload succeeded (201)")

    # 3. Invalid file (text file disguised or text/plain)
    status, res = multipart_post(upload_url, files={"file": ("script.txt", b"echo hello", "text/plain")})
    assert status in (400, 422), f"Invalid file expected 400/422, got {status}: {res}"
    print(f"[PASS] Text file rejected safely ({status})")

    # 4. Oversized image (> 10MB)
    large_bytes = b"0" * (10 * 1024 * 1024 + 1024)
    status, res = multipart_post(upload_url, files={"file": ("large.jpg", large_bytes, "image/jpeg")})
    assert status in (400, 413, 422), f"Oversized file expected 400/413/422, got {status}: {res}"
    print(f"[PASS] Oversized image rejected safely ({status})")

    # 5. Malicious filename and path traversal attempt
    traversal_name = "../../../../etc/passwd.jpg"
    status, res = multipart_post(upload_url, files={"file": (traversal_name, valid_jpeg, "image/jpeg")})
    assert status == 201, f"Upload with weird name failed: {res}"
    stored_name = res["data"]["filename"]
    assert "/" not in stored_name and "\\" not in stored_name, f"Path traversal in stored filename: {stored_name}"
    assert Path(f"uploads/{stored_name}").exists(), f"Stored file not in uploads: {stored_name}"
    print(f"[PASS] Path traversal safely neutralized, stored safely as {stored_name}")

    print("\n=== STEP 8: AI PIPELINE & DATABASE PERSISTENCE VERIFICATION ===")
    # Create an authenticated user and a report to attach AI analysis
    db = SessionLocal()
    prefix = uuid.uuid4().hex[:6]
    test_user = User(
        email=f"ai_tester_{prefix}@roadsense.ai",
        hashed_password=hash_password("Pass123!"),
        full_name="AI Tester",
        role=UserRole.CITIZEN,
        is_active=True
    )
    db.add(test_user)
    db.commit()

    test_report = Report(
        report_number=f"RS-2026-AI{prefix[:4]}",
        user_id=test_user.id,
        road_name="AI Highway Test",
        description="Testing real AI inference and persistence",
        road_type="highway",
        address="100 Highway Rd",
        latitude=12.9716,
        longitude=77.5946,
        status="submitted",
        ai_processed=False
    )
    db.add(test_report)
    db.commit()
    report_id = test_report.id
    db.close()

    # Call POST /api/v1/ai/predict with actual road image
    predict_url = f"{BASE_URL}/ai/predict"
    with open(test_img_path, "rb") as f:
        real_img_bytes = f.read()

    status, ai_resp = multipart_post(
        predict_url,
        fields={"report_id": report_id},
        files={"file": (test_img_path.name, real_img_bytes, "image/jpeg")}
    )
    assert status == 200, f"AI predict failed: {status}, {ai_resp}"
    assert ai_resp.get("success") is True, f"AI predict success is not True: {ai_resp}"
    assert "detections" in ai_resp, f"No detections key in response: {ai_resp}"
    assert "severity" in ai_resp, f"No severity key in response: {ai_resp}"
    assert "cost_range" in ai_resp, f"No cost_range in response: {ai_resp}"
    assert "recommendation" in ai_resp, f"No recommendation in response: {ai_resp}"
    print(f"[PASS] /ai/predict returned: {len(ai_resp['detections'])} detection(s), severity={ai_resp['severity']}, cost={ai_resp.get('cost_range')}")

    # Check database persistence
    db = SessionLocal()
    saved_analysis = db.query(AIAnalysis).filter(AIAnalysis.report_id == report_id).first()
    assert saved_analysis is not None, "AIAnalysis row was NOT created in DB!"
    print(f"[PASS] AIAnalysis row created in DB (id={saved_analysis.id}, report_id={saved_analysis.report_id})")

    updated_report = db.query(Report).filter(Report.id == report_id).first()
    assert updated_report.ai_processed is True, f"Report ai_processed not updated: {updated_report.ai_processed}"
    assert updated_report.severity is not None, f"Report severity not set: {updated_report.severity}"
    print(f"[PASS] Report updated in DB: ai_processed=True, severity={updated_report.severity}, priority={updated_report.priority}, cost={updated_report.estimated_repair_cost}")
    db.close()

    # Test Corrupt image on /ai/predict
    status, corrupt_res = multipart_post(
        predict_url,
        files={"file": ("corrupt.jpg", b"not an image at all", "image/jpeg")}
    )
    assert status in (400, 422), f"Corrupt image expected 400/422, got {status}: {corrupt_res}"
    print(f"[PASS] Corrupt image on /ai/predict rejected safely ({status})")

    print("\n=== STEP 10: DASHBOARD VERIFICATION ===")
    status, dash_stats = get_json(f"{BASE_URL}/dashboard/stats")
    assert status == 200, f"Dashboard stats failed: {status}, {dash_stats}"
    data = dash_stats.get("data", {})
    assert "total_inspections" in data, f"Missing total_inspections: {data}"
    assert data["total_inspections"] > 0, "Real inspections not counted in dashboard stats"
    print(f"[PASS] Dashboard stats: total_inspections={data['total_inspections']}, potholes={data.get('total_potholes')}, total_damage={data.get('total_damage_detected')}")

    status, breakdown = get_json(f"{BASE_URL}/dashboard/damage-breakdown")
    assert status == 200, f"Damage breakdown failed: {status}, {breakdown}"
    items = breakdown.get("data", {}).get("items", [])
    print(f"[PASS] Damage breakdown returned {len(items)} categories from real DB")

    status, recent = get_json(f"{BASE_URL}/dashboard/recent-inspections")
    assert status == 200, f"Recent inspections failed: {status}, {recent}"
    recent_items = recent.get("data", {}).get("items", [])
    assert len(recent_items) > 0, "Recent inspections empty"
    print(f"[PASS] Recent inspections returned {len(recent_items)} item(s) from real DB")

    print("\n=== STEP 11: MAP VERIFICATION ===")
    status, map_data = get_json(f"{BASE_URL}/dashboard/map-inspections")
    assert status == 200, f"Map inspections failed: {status}, {map_data}"
    markers = map_data.get("data", {}).get("items", [])
    assert len(markers) > 0, "No map markers found from real inspections"
    found_marker = next((m for m in markers if m.get("report_id") == report_id), None)
    assert found_marker is not None, f"Our test report {report_id} not found in map markers"
    assert found_marker.get("latitude") == 12.9716 and found_marker.get("longitude") == 77.5946
    print(f"[PASS] Map marker verified with real coordinates: lat={found_marker['latitude']}, lng={found_marker['longitude']}, damage_type={found_marker.get('damage_type')}")

    print("\n=== STEPS 7, 8, 9, 10, 11 ALL VERIFIED AND PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
