# SE-AI-Powered-Attendance-System
The AI-Powered Attendance Monitoring System uses facial recognition technology to simplify and improve the way attendance is tracked in schools. Students scan their face using a tablet, and instead of saving the actual face image, the system converts it into a face embedding. Making the data privacy-friendly and secure.

## Data Privacy and Security Measures
### Compliance & Legal Framework
- Philippine Data Privacy Act of 2012 (RA 10173)- Full compliance with national data protection regulation.
- Educational Purpose- System designed strictly for academic/prototype demonstration
- Informed Consent Required - All participants must provide written consent before facial data capture

### Security Implementation
- Encrypted Storage - All facial recognition data encrypted using industry-standard algorithms
- Access Control - Password-protected system with role-based authorization (Admin, Teacher, Student)
- Local Data Storage - Prototype operates on local server/device; no cloud transmission during testing phase
- Secure Database - MySQL with authentication, prepared statements to prevent SQL injection
- Session Management - Secure login sessions with automatic timeout mechanisms

## Key Features
- Face registration using a tablet.
- Privacy-Protected Face Embeddings (no raw images stored).
- AI-powered face recognition for attendance.
- Teachers can manage and monitor attendance in real time.
- Students can view their attendance records.
- admin can generate class and student reports
- Central database with secure access per role

## UML Diagrams

### 1. Use Case Diagram
The Use Case Diagram shows how the AI-Powered Attendance System works with four main users — Student, Teacher, Administrator, and Parent/Guardian. Students register and scan their faces for attendance, teachers manage records and reports, administrators handle users and the AI model, while parents receive notifications.

SE-AI-Powered-Attendance-System/UML/UseCaseDiagram.png

### 2. Class Diagram
This class diagram represents the structure of our AI-Powered Attendance System.
It shows the main classes such as Student, Teacher, Administrator, Parent/Guardian, AttendanceRecord, AIRecognitionSystem, NotificationSystem, and Database — and their relationships. The diagram highlights how data flows between components for recording attendance, sending notifications, and generating reports. It serves as a guide for system development and integration of all features.

![SE-AI-Powered-Attendance-System/UML/\[SOFT ENG\] CLASS DIAGRAM.jpg](<UML/Updated Class Diagram.png>)