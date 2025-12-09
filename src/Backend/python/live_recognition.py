import cv2
import face_recognition
import numpy as np

reference_image = face_recognition.load_image_file("uploads/test.jpg")
reference_encodings = face_recognition.face_encodings(reference_image)
if not reference_encodings:
    raise Exception("No face found in reference image.")
reference_encoding = reference_encodings[0]


video_capture = cv2.VideoCapture(0)

print(" Starting live recognition... Press 'q' to quit.")

while True:
    ret, frame = video_capture.read()
    if not ret:
        print("Failed to grab frame.")
        break

  
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small = small_frame[:, :, ::-1]

   
    face_locations = face_recognition.face_locations(rgb_small)
    face_encodings = face_recognition.face_encodings(rgb_small, face_locations)

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        similarity = np.dot(reference_encoding, face_encoding) / (
            np.linalg.norm(reference_encoding) * np.linalg.norm(face_encoding)
        )

        match = similarity >= 0.85
        label = f"{'MATCH' if match else 'NO MATCH'} ({similarity:.2f})"

        
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        color = (0, 255, 0) if match else (0, 0, 255)
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    cv2.imshow("Live Face Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()