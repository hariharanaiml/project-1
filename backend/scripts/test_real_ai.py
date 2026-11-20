from ultralytics import YOLO
from pathlib import Path

MODEL_PATH = Path("models/best.pt")
IMAGE_PATH = Path("uploads/test_road.jpg")

print("=================================")
print("RoadSense AI - Real AI Test")
print("=================================")

print("\n1. Checking files...")

print("Model:", MODEL_PATH)
print("Model exists:", MODEL_PATH.exists())

print("Image:", IMAGE_PATH)
print("Image exists:", IMAGE_PATH.exists())

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

if not IMAGE_PATH.exists():
    raise FileNotFoundError(f"Test image not found: {IMAGE_PATH}")

print("\n2. Loading trained YOLO model...")

model = YOLO(str(MODEL_PATH))

print("Model loaded successfully!")

print("\n3. Model classes:")
print(model.names)

print("\n4. Running detection...")

results = model.predict(
    source=str(IMAGE_PATH),
    conf=0.25,
    imgsz=640,
    device="cpu",
    save=True
)

print("\n5. Detection Results")
print("---------------------------------")

detected = False

for result in results:

    if result.boxes is None or len(result.boxes) == 0:
        print("No road damage detected.")
        continue

    detected = True

    for box in result.boxes:

        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        coordinates = box.xyxy[0].tolist()

        class_name = model.names[class_id]

        print(
            f"Damage: {class_name} | "
            f"Confidence: {confidence:.2f} | "
            f"Box: {coordinates}"
        )

print("\n=================================")

if detected:
    print("SUCCESS: Road damage detected!")
else:
    print("Inference completed, but no damage was detected.")

print("=================================")