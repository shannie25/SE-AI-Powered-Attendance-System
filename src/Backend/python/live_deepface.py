import os
import cv2
from deepface import DeepFace

REF_PATH = "../uploads/me.jpg"
if not os.path.exists(REF_PATH):
    raise FileNotFoundError(f"Reference image not found: {REF_PATH}")

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Cannot open webcam. Try VideoCapture(1) or (2).")

print("Starting live verification. Press Q to quit.")
while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    verified = False
    distance = None
    try:
        result = DeepFace.verify(
            img1_path=REF_PATH,
            img2_path=rgb,
            detector_backend="retinaface",  
            model_name="VGG-Face",
            enforce_detection=False
        )
        verified = bool(result.get("verified", False))
        distance = result.get("distance", None)
    except Exception as e:
        
        print("Error while processing frame:", e)

    label = "MATCH" if verified else "NO MATCH"
    if distance is not None:
        label += f" ({distance:.3f})"
    cv2.putText(frame, label, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1,
                (0, 255, 0) if verified else (0, 0, 255), 2)

    cv2.imshow("Live DeepFace Verification", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()