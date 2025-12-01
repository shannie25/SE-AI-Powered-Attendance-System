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

## Backend Overview

The backend is built using **Node.js** and **Express.js**, located in `src/Backend/`. It handles all API endpoints for face registration, attendance logging, student management, and future dashboard integration.

### Structure:
- `controllers/` — Contains logic for handling attendance, recognition, and student data.
- `routes/` — Defines API endpoints for face recognition, attendance, and student registration.
- `server.js` — Initializes the Express server and middleware.
- `data/` — Placeholder for future database integration or JSON-based logging.

### Key Endpoints:
- `POST /students` — Register a new student.
- `POST /recognize` — Submit face embedding for recognition.
- `POST /attendance` — Log attendance manually or via recognition.
- `GET /attendance` — Retrieve attendance records.

> The backend is modular and ready for integration with a Figma-ready frontend dashboard.

## UML Diagrams

### 1. Use Case Diagram
The Use Case Diagram shows how the AI-Powered Attendance System works with four main users — Student, Teacher, Administrator, and Parent/Guardian. Students register and scan their faces for attendance, teachers manage records and reports, administrators handle users and the AI model, while parents receive notifications.

![C:\SOFTENG-MAGSAYO\SE-AI-Powered-Attendance-System\UML\UseCaseDiagram.png](UML/UseCaseDiagram.png)

### 2. Class Diagram
This class diagram represents the structure of our AI-Powered Attendance System.
It shows the main classes such as Student, Teacher, Administrator, Parent/Guardian, AttendanceRecord, AIRecognitionSystem, NotificationSystem, and Database — and their relationships. The diagram highlights how data flows between components for recording attendance, sending notifications, and generating reports. It serves as a guide for system development and integration of all features.

![SE-AI-Powered-Attendance-System/UML/\[SOFT ENG\] CLASS DIAGRAM.jpg](<UML/Updated Class Diagram.png>)

### 3. Use Case Description
The Use Case Description explains how each actor (Student, Administrator, Teacher, and Parent/Guardian) interacts with the system. It defines the system’s main functions such as face registration, attendance scanning, report generation, and notification handling. These descriptions provide a detailed view of the system’s behavior in different user scenarios.

[SE-AI-Powered-Attendance-System\UML\UML Use Case Description_ Attendance System.pdf](<UML/UML Use Case Description_ Attendance System.pdf>)

## 4. System Architectural
The **AI-Powered Attendance System** follows a **Client–Server Layered Architecture** that separates the system into three main layers: the **Presentation Layer**, **Application Layer**, and **Data Layer**.  
This design ensures **functional independence**, making the system more scalable, maintainable, and secure.

### Layers Description
1. **Presentation Layer**
   - This is the tablet interface used by students and teachers.
   - Handles user interactions such as facial registration, attendance scanning, and report viewing.

2. **Application Layer**
   - Contains the **AI recognition module**, **attendance logic**, and business rules**.
   - Processes input from the presentation layer and communicates with the database.
  
3. **Data Layer**
   - Responsible for storing and managing data in the **MySQL Database**.
   - Uses encryptioin and authentication to ensure secure data access and storage.
  
## Architectural Flow
The system's overall data flow and interaction between components can be illustrated as follows:
```
[Tablet Interface (Student/Teacher)]
↓
[AI Recognition Module / Application Logic]
↓
[Server / API Communication Layer]
↓
[Database (MySQL)]
↑
[Admin Dashboard / Reports]
→
[Parent/Guardian Notification (SMS)]
```

## Procedural Design

- This procedural design outlines the complete flow of the **AI-Powered Attendance Monitoring System**, detailing how **Students**, **Teachers**, and **Admins** interact with the platform.  
- It includes **user type selection, authentication, password recovery, facial recognition attendance, dashboard features, and administrative controls.**
<img width="1357" height="1562" alt="Procedural Design" src="https://github.com/user-attachments/assets/e7c1a7a7-309a-48b5-b2d6-9945f84902e1" />

## 1. System Entry

- User opens the Attendance System.
- The system prompts the user to select their **User Type**:
  - Student  
  - Teacher  
  - Admin  

## 2. Account Authentication

### Login Process
- User enters their **username** and **password**.
- The system checks if the credentials are valid.

#### Invalid Credentials
- If login fails, system displays:  
  *“Invalid username or password. Forgot password?”*
- If the user selects **Forgot Password**:
  - Enter registered email.
  - Receive a password reset link.
  - Set a new password.
  - Return to login screen after successful reset.

#### Valid Credentials
- If login is successful:
  - System redirects the user to their **respective dashboard** based on selected user type.

## 3. Teacher Workflow

Once logged in, the **Teacher Dashboard** allows the teacher to:

- View students’ attendance records  
- Manage attendance (**Present, Late, Absent**)  
- View notifications  
- Sign out (ends the session)  

## 4. Student Workflow

Once logged in, the **Student Dashboard** allows the student to:

### Facial Recognition Attendance
- Student scans their face using the system camera.
- If face detected, system begins identity verification.

#### Outcomes:
- **Recognized** → Attendance is logged in the database.  
- **Not Recognized** → System logs the attempt or prompts retry.  
- **Face Not Detected** → System prompts the student to reposition.  

### Additional Student Features
- View attendance-related notifications  
- View class schedule  
- Sign out (ends the session)  

## 5. Admin Workflow

Once logged in, the **Admin Dashboard** allows the admin to:

- Manage user accounts (**Add, Edit, Delete**)  
- Train the AI facial recognition model  
- Manage notifications / SMS logs  
- Backup or restore the database  
- Sign out (ends the session)  

## 6. System Exit

- All user workflows end when the user selects **Sign Out**.  
- Leads to the system’s **termination point (End).**

---

## Summary Flow

1. **System Entry → User Type Selection**  
2. **Authentication → Login / Password Recovery**  
3. **Dashboard Access → Teacher / Student / Admin Workflows**  
4. **System Exit → Sign Out → End**  

> "In future versions, a **Parent Dashboard** may be added for detailed attendance tracking and analytics."


## Team and Contributions

| **Member** | **Role** | **Contributions** |
|-------------|-----------|-------------------|
| **Owen Robert Magsayo** | Team Leader | - Created and updated the **README.md** and full project **documentation**.<br>- Designed both the **Use Case Diagram** and **Class Diagram**.<br>- Consolidated and organized all files for submission.<br>- Created the **Procedural Design**.<br>- Contributed to the **UI Interface Design**. |
| **Annie Rose Mamitag**  | Team Member    | - Created the GitHub repository.<br>- Designed diagrams and architectural flow.<br>- Added Key Features section.<br>- Created UI interface and backend folder structure.<br>**- Developed and modularized the backend using Express.js.**<br>**- Validated API endpoints and prepared for frontend integration.** |
| **Norwejean Arnado** | Team Member | - Collaborated on both the **Use Case Diagram** and **Class Diagram**.<br>- Wrote the **Data Privacy and Security Measures**, **Compliance & Legal Framework**, and **Security Implementation** sections.<br>- Modified and refined the final **Class Diagram** design.<br>- Created the **Data Design** and database. |


