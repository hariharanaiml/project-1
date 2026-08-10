"""
Automated smoke test for the RoadSense AI backend (Milestone 1).

Exercises the full API surface against a live FastAPI TestClient:
  - health check,
  - report CRUD (create, list, get, patch, status transition, delete),
  - image upload + static file serving.

Run from the `backend/` directory:
    python scripts/smoke_test.py

The script cleans up after itself (the created report is deleted). Uploaded
test images are stored in `uploads/` and removed at the end.
"""

import io
import os
import sys
from pathlib import Path

# Ensure the backend package root is importable regardless of CWD.
BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


PASS = 0
FAIL = 0


def check(label: str, condition: bool, detail: str = "") -> None:
    """Record a pass/fail assertion with an optional detail message."""
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✓ {label}")
    else:
        FAIL += 1
        print(f"  ✗ {label}  {detail}")


def main() -> int:
    """Run all smoke-test assertions against the live app."""
    print("\n=== RoadSense AI — Milestone 1 Smoke Test ===\n")

    with TestClient(app) as client:
        # 1. Health check -------------------------------------------------------
        print("[1] Health check")
        resp = client.get("/api/health")
        check("GET /api/health → 200", resp.status_code == 200, f"got {resp.status_code}")
        body = resp.json()
        check("health payload has status ok", body.get("status") == "ok", str(body))
        check("database reported connected", body.get("database") == "connected", str(body))

        # 2. Root + docs --------------------------------------------------------
        print("[2] Root & docs")
        check("GET / → 200", client.get("/").status_code == 200)
        check("GET /docs → 200", client.get("/docs").status_code == 200)
        check("GET /openapi.json → 200", client.get("/openapi.json").status_code == 200)

        # 3. Report CRUD --------------------------------------------------------
        print("[3] Report CRUD")
        create_payload = {
            "road_name": "Smoke Test Road",
            "description": "Automated smoke test report created during verification.",
            "road_type": "city_road",
            "address": "123 Test Ave",
            "latitude": 40.7128,
            "longitude": -74.0060,
        }

        resp = client.post("/api/v1/reports", json=create_payload)
        check("POST /api/v1/reports → 201", resp.status_code == 201, f"got {resp.status_code}: {resp.text}")
        created = resp.json().get("data", {})
        report_id = created.get("id")
        report_number = created.get("report_number", "")
        check("created report has id", bool(report_id))
        # Format: RS-YYYY-NNNNNN  →  "RS-" (3) + year (4) + "-" (1) + 6 digits = 14 chars.
        # The second "-" sits at index 7 (0-based): "RS-2026-000001".
        check("report_number matches RS-YYYY-NNNNNN", len(report_number) == 14 and report_number.startswith("RS-") and report_number[7] == "-", report_number)

        resp = client.get("/api/v1/reports")
        check("GET /api/v1/reports → 200", resp.status_code == 200, f"got {resp.status_code}")
        listing = resp.json()
        check("list contains created report", any(item.get("id") == report_id for item in listing.get("data", [])))

        resp = client.get(f"/api/v1/reports/{report_id}")
        check("GET /api/v1/reports/{id} → 200", resp.status_code == 200, f"got {resp.status_code}")
        check("fetched report matches road_name", resp.json().get("data", {}).get("road_name") == "Smoke Test Road")

        # Filter by status
        resp = client.get("/api/v1/reports", params={"status": "submitted"})
        check("list filtered by status=submitted contains report", any(item.get("id") == report_id for item in resp.json().get("data", [])))

        # 4. Update + status transition -----------------------------------------
        print("[4] Update & status")
        resp = client.patch(f"/api/v1/reports/{report_id}", json={"description": "Updated by smoke test."})
        check("PATCH /api/v1/reports/{id} → 200", resp.status_code == 200, f"got {resp.status_code}")
        check("description updated", resp.json().get("data", {}).get("description", "").startswith("Updated by smoke test"))

        resp = client.patch(f"/api/v1/reports/{report_id}/status", json={"status": "resolved"})
        check("PATCH /api/v1/reports/{id}/status → 200", resp.status_code == 200, f"got {resp.status_code}")
        data = resp.json().get("data", {})
        check("status became resolved", data.get("status") == "resolved", str(data.get("status")))
        check("resolved_at was set", data.get("resolved_at") is not None)

        # 4b. PUT full replace --------------------------------------------------
        print("[4b] PUT full replace")
        put_payload = {
            "road_name": "Put Replaced Road",
            "description": "Fully replaced by PUT smoke test.",
            "road_type": "highway",
            "address": "456 Put Ave",
            "latitude": 51.5074,
            "longitude": -0.1278,
            "severity": "high",
            "damage_type": "pothole",
            "priority": "high",
        }
        resp = client.put(f"/api/v1/reports/{report_id}", json=put_payload)
        check("PUT /api/v1/reports/{id} → 200", resp.status_code == 200, f"got {resp.status_code}")
        put_data = resp.json().get("data", {})
        check("PUT replaced road_name", put_data.get("road_name") == "Put Replaced Road", str(put_data.get("road_name")))
        check("PUT applied severity", put_data.get("severity") == "high")
        check("PUT preserved id", put_data.get("id") == report_id, str(put_data.get("id")))
        check("PUT preserved report_number", put_data.get("report_number") == report_number, str(put_data.get("report_number")))

        # 5. Image upload -------------------------------------------------------
        print("[5] Image upload")
        # Minimal valid PNG bytes (1x1 transparent pixel).
        png_bytes = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
            "0000000d49444154789c626001000000ffff03000006000557bfabd40000000049454e44ae426082"
        )
        files = {"file": ("test_image.png", io.BytesIO(png_bytes), "image/png")}
        resp = client.post("/api/v1/upload", files=files)
        check("POST /api/v1/upload → 201", resp.status_code == 201, f"got {resp.status_code}: {resp.text}")
        upload = resp.json().get("data", {})
        file_url = upload.get("url", "")
        check("upload response has url", file_url.startswith("/uploads/"), file_url)
        check("upload response has size", upload.get("size", 0) > 0)

        # 6. Static file serving ------------------------------------------------
        print("[6] Static file serving")
        static = client.get(file_url)
        check(f"GET {file_url} → 200", static.status_code == 200, f"got {static.status_code}")
        check("served content-type is image/png", static.headers.get("content-type", "").startswith("image/png"), static.headers.get("content-type", ""))

        # Reject an unsupported type
        bad_files = {"file": ("notes.txt", io.BytesIO(b"hello"), "text/plain")}
        resp = client.post("/api/v1/upload", files=bad_files)
        check("rejects text/plain upload (422)", resp.status_code == 422, f"got {resp.status_code}")

        # 6b. Unversioned alias routes (/api/reports) ---------------------------
        print("[6b] Unversioned alias routes")
        alias_payload = {
            "road_name": "Alias Road",
            "description": "Created via unversioned alias endpoint.",
            "road_type": "city_road",
            "address": "789 Alias Blvd",
            "latitude": 35.6762,
            "longitude": 139.6503,
        }
        resp = client.post("/api/reports", json=alias_payload)
        check("POST /api/reports → 201", resp.status_code == 201, f"got {resp.status_code}: {resp.text}")
        alias_report = resp.json().get("data", {})
        alias_id = alias_report.get("id")
        check("alias create has id", bool(alias_id))

        resp = client.get(f"/api/reports/{alias_id}")
        check("GET /api/reports/{id} → 200", resp.status_code == 200, f"got {resp.status_code}")
        check("alias get matches road_name", resp.json().get("data", {}).get("road_name") == "Alias Road")

        resp = client.get("/api/reports")
        check("GET /api/reports → 200", resp.status_code == 200, f"got {resp.status_code}")
        check("alias list contains report", any(item.get("id") == alias_id for item in resp.json().get("data", [])))

        alias_put = {
            "road_name": "Alias Road Updated",
            "description": "Updated via unversioned alias PUT.",
            "road_type": "bridge",
            "address": "789 Alias Blvd",
            "latitude": 35.6762,
            "longitude": 139.6503,
        }
        resp = client.put(f"/api/reports/{alias_id}", json=alias_put)
        check("PUT /api/reports/{id} → 200", resp.status_code == 200, f"got {resp.status_code}")
        check("alias PUT updated road_name", resp.json().get("data", {}).get("road_name") == "Alias Road Updated")

        resp = client.delete(f"/api/reports/{alias_id}")
        check("DELETE /api/reports/{id} → 204", resp.status_code == 204, f"got {resp.status_code}")
        resp = client.get(f"/api/reports/{alias_id}")
        check("GET deleted alias report → 404", resp.status_code == 404, f"got {resp.status_code}")

        # 6c. Request validation ------------------------------------------------
        print("[6c] Request validation")
        resp = client.post("/api/v1/reports", json={"road_name": "X", "description": "short"})
        check("POST invalid fields → 422", resp.status_code == 422, f"got {resp.status_code}")
        check("validation envelope success=false", resp.json().get("success") is False)

        resp = client.post(
            "/api/v1/reports",
            json={
                "road_name": "Coord Road",
                "description": "Missing longitude on purpose for validation test.",
                "latitude": 10.0,
            },
        )
        check("POST latitude without longitude → 422", resp.status_code == 422, f"got {resp.status_code}")

        resp = client.post(
            "/api/v1/reports",
            json={
                "road_name": "Bad Road",
                "description": "Latitude out of range should be rejected by pydantic.",
                "latitude": 95.0,
                "longitude": 10.0,
            },
        )
        check("POST latitude out of range → 422", resp.status_code == 422, f"got {resp.status_code}")

        resp = client.get("/api/v1/reports/nonexistent-id")
        check("GET nonexistent report → 404", resp.status_code == 404, f"got {resp.status_code}")
        check("404 envelope code NOT_FOUND", resp.json().get("error", {}).get("code") == "NOT_FOUND")

        resp = client.put(f"/api/v1/reports/{report_id}", json={"road_name": "Incomplete"})
        check("PUT missing description → 422", resp.status_code == 422, f"got {resp.status_code}")

        # 6d. Milestone 4 — new upload endpoint /api/v1/upload -------------------
        print("[6d] Milestone 4 upload endpoint")
        m4_files = {"file": ("road_damage.png", io.BytesIO(png_bytes), "image/png")}
        resp = client.post("/api/v1/upload", files=m4_files)
        check("POST /api/v1/upload → 201", resp.status_code == 201, f"got {resp.status_code}: {resp.text}")
        m4_upload = resp.json().get("data", {})
        m4_url = m4_upload.get("url", "")
        check("upload returns filename (uuid)", len(m4_upload.get("filename", "")) > 8, str(m4_upload.get("filename")))
        check("upload returns original_filename", m4_upload.get("original_filename") == "road_damage.png", str(m4_upload.get("original_filename")))
        check("upload returns uploaded_at", bool(m4_upload.get("uploaded_at")))
        check("upload returns size", m4_upload.get("size", 0) > 0)
        check("upload returns mime_type", m4_upload.get("mime_type") == "image/png", str(m4_upload.get("mime_type")))
        check("upload returns url", m4_url.startswith("/uploads/"), m4_url)
        check("upload returns path", m4_upload.get("path", "").startswith("uploads/"), str(m4_upload.get("path")))
        # File actually saved on disk.
        stored_m4 = m4_upload.get("filename", "")
        m4_disk = BACKEND_ROOT / "uploads" / stored_m4
        check("file saved to backend/uploads/", m4_disk.exists() and m4_disk.stat().st_size > 0, str(m4_disk))

        # Reject unsupported type (WEBP no longer allowed — JPG/JPEG/PNG only).
        webp_files = {"file": ("img.webp", io.BytesIO(b"webp-bytes"), "image/webp")}
        resp = client.post("/api/v1/upload", files=webp_files)
        check("POST /api/v1/upload rejects image/webp (422)", resp.status_code == 422, f"got {resp.status_code}")
        check("upload 422 envelope success=false", resp.json().get("success") is False)
        check("upload 422 error code VALIDATION_ERROR", resp.json().get("error", {}).get("code") == "VALIDATION_ERROR")

        # Alias /api/upload
        resp = client.post("/api/upload", files={"file": ("alias.png", io.BytesIO(png_bytes), "image/png")})
        check("POST /api/upload (alias) → 201", resp.status_code == 201, f"got {resp.status_code}: {resp.text}")
        alias_upload = resp.json().get("data", {})
        alias_url = alias_upload.get("url", "")
        alias_disk = BACKEND_ROOT / "uploads" / alias_upload.get("filename", "")
        check("alias upload returns mime_type", alias_upload.get("mime_type") == "image/png", str(alias_upload.get("mime_type")))
        check("alias upload file saved", alias_disk.exists(), str(alias_disk))

        # 6e. Milestone 5 — structured mock AI service + persistence ------------
        print("[6e] Milestone 5 mock AI service")
        ai_payload = {"report_id": report_id, "image_path": "/uploads/mock.jpg"}
        resp = client.post("/api/v1/ai/analyze", json=ai_payload)
        check("POST /api/v1/ai/analyze → 200", resp.status_code == 200, f"got {resp.status_code}: {resp.text}")
        ai_data = resp.json().get("data", {})
        check("AI response flagged mock", ai_data.get("mock") is True, str(ai_data))
        check("AI response has damage_detected", ai_data.get("damage_detected") is True, str(ai_data))
        check("AI response has damage_type", ai_data.get("damage_type") == "pothole", str(ai_data.get("damage_type")))
        check("AI response has severity", ai_data.get("severity") == "medium", str(ai_data.get("severity")))
        check("AI response has confidence", ai_data.get("confidence", 0) > 0)
        check("AI response has estimated_repair_cost", float(ai_data.get("estimated_repair_cost") or 0) > 0)
        check("AI response has repair_method", bool(ai_data.get("repair_method")), str(ai_data.get("repair_method")))
        check("AI response has priority", bool(ai_data.get("priority")), str(ai_data.get("priority")))
        check("AI response references report_id", ai_data.get("report_id") == report_id, str(ai_data.get("report_id")))
        analysis_id = ai_data.get("analysis_id")
        check("AI response persists analysis_id", bool(analysis_id), str(analysis_id))

        # Persisted AIAnalysis row + report fields updated.
        try:
            from app.db.session import SessionLocal
            from app.models.ai_analysis import AIAnalysis
            with SessionLocal() as sess:
                row = sess.get(AIAnalysis, analysis_id)
                check("AIAnalysis row persisted", row is not None, str(analysis_id))
                if row is not None:
                    check("persisted confidence_score set", row.confidence_score is not None)
                    check("persisted repair_cost set", row.repair_cost is not None)
                    check("persisted repair_recommendation set", bool(row.repair_recommendation))
                    check("persisted analysis_status completed", str(row.analysis_status.value) == "completed")
        except Exception as exc:  # pragma: no cover
            check("AIAnalysis persistence DB check ran", False, str(exc))

        # Report was backfilled with AI-derived fields.
        check("report ai_processed", resp.json().get("data", {}).get("report_id") is not None)
        resp_report = client.get(f"/api/v1/reports/{report_id}")
        report_after = resp_report.json().get("data", {})
        check("report.ai_processed == true", report_after.get("ai_processed") is True, str(report_after.get("ai_processed")))
        check("report.severity backfilled", report_after.get("severity") == "medium", str(report_after.get("severity")))
        check("report.damage_type backfilled", report_after.get("damage_type") == "pothole", str(report_after.get("damage_type")))
        check("report.estimated_repair_cost backfilled", float(report_after.get("estimated_repair_cost") or 0) > 0)

        # Unversioned alias `POST /api/ai/analyze`
        print("[6e2] Unversioned AI alias")
        resp = client.post("/api/ai/analyze", json=ai_payload)
        check("POST /api/ai/analyze (alias) → 200", resp.status_code == 200, f"got {resp.status_code}: {resp.text}")
        alias_ai = resp.json().get("data", {})
        check("alias returns structured AI response", alias_ai.get("damage_detected") is True, str(alias_ai))

        # 404 for a nonexistent report.
        resp = client.post("/api/v1/ai/analyze", json={"report_id": "nonexistent-id"})
        check("POST /api/v1/ai/analyze nonexistent report → 404", resp.status_code == 404, f"got {resp.status_code}")
        check("AI 404 envelope code NOT_FOUND", resp.json().get("error", {}).get("code") == "NOT_FOUND")

        # Model registry (mock).
        resp = client.get("/api/v1/ai/models")
        check("GET /api/v1/ai/models → 200", resp.status_code == 200, f"got {resp.status_code}")
        check("AI response has summary", bool(ai_data.get("summary")), str(ai_data.get("summary")))
        check("AI response has detections", isinstance(ai_data.get("detections"), list) and len(ai_data.get("detections")) > 0, str(ai_data.get("detections")))

        # 6f. Milestone 4 — delete_uploaded_file utility --------------------------
        print("[6f] Milestone 4 delete_uploaded_file utility")
        from app.utils.upload_utils import delete_uploaded_file  # noqa: E402

        delete_files = {"file": ("to_delete.png", io.BytesIO(png_bytes), "image/png")}
        resp = client.post("/api/v1/upload", files=delete_files)
        check("POST /api/v1/upload (delete test) → 201", resp.status_code == 201, f"got {resp.status_code}")
        delete_name = resp.json().get("data", {}).get("filename", "")
        delete_disk = BACKEND_ROOT / "uploads" / delete_name
        check("file exists before delete", delete_disk.exists(), str(delete_disk))
        check("delete_uploaded_file returns True", delete_uploaded_file(delete_name) is True)
        check("file removed after delete", not delete_disk.exists(), str(delete_disk))
        check("delete_uploaded_file missing file returns False", delete_uploaded_file(delete_name) is False)
        check("delete_uploaded_file refuses traversal", delete_uploaded_file("../README.md") is False)

        # 6g. Milestone — auth, stats, admin, and AI analysis reads ---------------
        print("[6g] Auth + stats + admin + AI analysis reads")

        # Register (admin role for admin endpoints) + login flow.
        reg = client.post(
            "/api/v1/auth/register",
            json={
                "email": "smoke_admin@example.com",
                "full_name": "Smoke Admin",
                "password": "password123",
                "role": "admin",
            },
        )
        check("POST /api/v1/auth/register → 201", reg.status_code == 201, f"got {reg.status_code}: {reg.text}")
        reg_data = reg.json().get("data", {})
        admin_token = reg_data.get("access_token", "")
        check("register returns access_token", bool(admin_token))
        check("register returns user email", reg_data.get("user", {}).get("email") == "smoke_admin@example.com")

        dup = client.post(
            "/api/v1/auth/register",
            json={"email": "smoke_admin@example.com", "full_name": "Dup", "password": "password123"},
        )
        check("duplicate email → 409", dup.status_code == 409, f"got {dup.status_code}")

        bad_login = client.post(
            "/api/v1/auth/login",
            json={"email": "smoke_admin@example.com", "password": "wrongpass"},
        )
        check("bad login → 401", bad_login.status_code == 401, f"got {bad_login.status_code}")

        login = client.post(
            "/api/v1/auth/login",
            json={"email": "smoke_admin@example.com", "password": "password123"},
        )
        check("POST /api/v1/auth/login → 200", login.status_code == 200, f"got {login.status_code}")
        admin_token = login.json().get("data", {}).get("access_token", admin_token)

        me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        check("GET /api/v1/auth/me → 200", me.status_code == 200, f"got {me.status_code}: {me.text[:120]}")
        check("auth/me returns admin role", me.json().get("data", {}).get("role") == "admin")

        # Public stats endpoints.
        for path in [
            "/api/v1/dashboard/overview",
            "/api/v1/dashboard/recent-activity",
            "/api/v1/analytics/overview",
            "/api/v1/analytics/trends",
            "/api/v1/analytics/distributions",
        ]:
            resp = client.get(path)
            check(f"GET {path} → 200", resp.status_code == 200, f"got {resp.status_code}")

        # Admin endpoints require an admin token.
        for path in ["/api/v1/admin/overview", "/api/v1/admin/users", "/api/v1/admin/system-health"]:
            resp = client.get(path, headers={"Authorization": f"Bearer {admin_token}"})
            check(f"GET {path} → 200", resp.status_code == 200, f"got {resp.status_code}: {resp.text[:120]}")

        noauth = client.get("/api/v1/admin/users")
        check("GET /admin/users without token → 401", noauth.status_code == 401, f"got {noauth.status_code}")

        # AI analysis read endpoints.
        latest = client.get("/api/v1/ai/analyses/latest")
        check("GET /api/v1/ai/analyses/latest → 200", latest.status_code == 200, f"got {latest.status_code}: {latest.text[:200]}")
        latest_data = latest.json().get("data", {})
        check("latest analysis references analyzed report", latest_data.get("report_id") == report_id, str(latest_data.get("report_id")))

        analyses_list = client.get("/api/v1/ai/analyses")
        check("GET /api/v1/ai/analyses → 200", analyses_list.status_code == 200, f"got {analyses_list.status_code}")
        analyses_by_report = client.get("/api/v1/ai/analyses", params={"report_id": report_id})
        check("GET /api/v1/ai/analyses?report_id → 200", analyses_by_report.status_code == 200, f"got {analyses_by_report.status_code}")
        analyses_by_id = client.get(f"/api/v1/ai/analyses/{analysis_id}")
        check("GET /api/v1/ai/analyses/{id} → 200", analyses_by_id.status_code == 200, f"got {analyses_by_id.status_code}")

        # Clean up the admin smoke user.
        try:
            from app.db.session import SessionLocal  # noqa: E402
            from app.models.user import User  # noqa: E402

            with SessionLocal() as sess:
                admin_user = sess.query(User).filter(User.email == "smoke_admin@example.com").first()
                if admin_user:
                    sess.delete(admin_user)
                    sess.commit()
        except Exception as exc:  # pragma: no cover
            check("admin smoke user cleanup ran", False, str(exc))

        # 7. Cleanup ------------------------------------------------------------
        print("[7] Cleanup")
        resp = client.delete(f"/api/v1/reports/{report_id}")
        check("DELETE /api/v1/reports/{id} → 204", resp.status_code == 204, f"got {resp.status_code}")

        resp = client.get(f"/api/v1/reports/{report_id}")
        check("GET deleted report → 404", resp.status_code == 404, f"got {resp.status_code}")

        # Remove the uploaded test files from disk.
        for item in [file_url, m4_url, alias_url]:
            if item:
                stored = item.rsplit("/", 1)[-1]
                upload_path = BACKEND_ROOT / "uploads" / stored
                if upload_path.exists():
                    upload_path.unlink()

    print(f"\n=== Results: {PASS} passed, {FAIL} failed ===\n")
    return 1 if FAIL else 0


if __name__ == "__main__":
    os.chdir(BACKEND_ROOT)  # ensure relative paths (sqlite, uploads) resolve correctly
    sys.exit(main())

