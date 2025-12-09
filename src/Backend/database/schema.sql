CREATE DATABASE attendance_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;


USE attendance_system;

-- STUDENT
-- Core table storing student information
CREATE TABLE Student (
    studentID VARCHAR(20) PRIMARY KEY NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    lastLogin TIMESTAMP NULL DEFAULT NULL,
    accountStatus ENUM('Active', 'Inactive', 'Locked') NOT NULL DEFAULT 'Active',
    phoneNumber VARCHAR(15) NULL,
    course VARCHAR(100) NOT NULL,
    yearLevel INT NOT NULL CHECK (yearLevel BETWEEN 1 AND 5),
    section VARCHAR(20) NULL,
    enrollmentStatus ENUM('Active', 'Inactive', 'Graduated', 'Dropped') NOT NULL DEFAULT 'Active',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_accountStatus (accountStatus),
    INDEX idx_enrollmentStatus (enrollmentStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- FACE_DATA
-- Stores encrypted facial biometric data
CREATE TABLE Face_Data (
    faceDataID INT PRIMARY KEY AUTO_INCREMENT,
    studentID VARCHAR(20) UNIQUE NOT NULL,
    faceEncoding LONGBLOB NOT NULL,
    captureDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    encryptionStatus ENUM('Encrypted', 'Pending', 'Failed') NOT NULL DEFAULT 'Encrypted',
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    expiryDate DATE NULL,
    captureQuality DECIMAL(5,2) NOT NULL CHECK (captureQuality BETWEEN 0 AND 100),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (studentID) REFERENCES Student(studentID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    INDEX idx_isActive (isActive),
    INDEX idx_encryptionStatus (encryptionStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TEACHER
-- Stores teacher/instructor information
CREATE TABLE Teacher (
    teacherID VARCHAR(20) PRIMARY KEY NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15) NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_isActive (isActive),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- COURSE
-- Stores course/subject details
CREATE TABLE Course (
    courseID VARCHAR(20) PRIMARY KEY NOT NULL,
    courseName VARCHAR(150) NOT NULL,
    courseCode VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NULL,
    units INT NOT NULL CHECK (units BETWEEN 1 AND 6) ,
    teacherID VARCHAR(20) NOT NULL,
    schedule VARCHAR(100) NULL,
    room VARCHAR(50) NULL ,
    semester ENUM('1st', '2nd', 'Summer') NOT NULL,
    schoolYear VARCHAR(10) NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (teacherID) REFERENCES Teacher(teacherID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    INDEX idx_teacherID (teacherID),
    INDEX idx_isActive (isActive),
    INDEX idx_semester (semester, schoolYear)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ATTENDANCE
-- Central table for attendance records
CREATE TABLE Attendance (
    attendanceID INT PRIMARY KEY AUTO_INCREMENT,
    studentID VARCHAR(20) NOT NULL,
    courseID VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    timeIn TIME NULL,
    timeOut TIME NULL,
    status ENUM('Present', 'Late', 'Absent', 'Excused') NOT NULL DEFAULT 'Absent',
    verificationMethod ENUM('Facial Recognition', 'Manual', 'Override') NOT NULL DEFAULT 'Facial Recognition',
    confidence DECIMAL(5,2) NULL CHECK (confidence BETWEEN 0 AND 100),
    remarks TEXT NULL,
    recordedBy VARCHAR(20) NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (studentID) REFERENCES Student(studentID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (courseID) REFERENCES Course(courseID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Business Rule: One student can only have ONE attendance record per course per day
    UNIQUE KEY unique_daily_attendance (studentID, courseID, date),
    
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_verificationMethod (verificationMethod),
    INDEX idx_student_date (studentID, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- PARENT_GUARDIAN
-- Stores parent/guardian contact informatioN
CREATE TABLE Parent_Guardian (
    parentID INT PRIMARY KEY AUTO_INCREMENT,
    studentID VARCHAR(20) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    relationship ENUM('Father', 'Mother', 'Guardian', 'Other') NOT NULL,
    contactNumber VARCHAR(15) NOT NULL,
    email VARCHAR(100) NULL,
    passwordHash VARCHAR(255) NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    preferredContact ENUM('SMS', 'Email', 'Both') NOT NULL DEFAULT 'SMS',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (studentID) REFERENCES Student(studentID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    INDEX idx_studentID (studentID),
    INDEX idx_isActive (isActive),
    INDEX idx_contactNumber (contactNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTIFICATION
-- Logs all notifications sent to parents/guardians
CREATE TABLE Notification (
    notificationID INT PRIMARY KEY AUTO_INCREMENT,
    parentID INT NOT NULL,
    studentID VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    sentDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deliveryStatus ENUM('Sent', 'Failed', 'Pending', 'Delivered') NOT NULL DEFAULT 'Pending',
    notificationType ENUM('Attendance', 'Late', 'Absent', 'Alert') NOT NULL,
    deliveryMethod ENUM('SMS', 'Email', 'Push') NOT NULL,
    retryCount INT NOT NULL DEFAULT 0,
    deliveredAt TIMESTAMP NULL DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parentID) REFERENCES Parent_Guardian(parentID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (studentID) REFERENCES Student(studentID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    INDEX idx_deliveryStatus (deliveryStatus),
    INDEX idx_sentDate (sentDate),
    INDEX idx_parentID (parentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ADMINISTRATOR
-- System administrator accounts
CREATE TABLE Administrator (
    adminID INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    role ENUM('Super Admin', 'Admin', 'IT Support') NOT NULL DEFAULT 'Admin',
    lastLogin TIMESTAMP NULL DEFAULT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- REPORT
-- Stores metadata for generated attendance reports
CREATE TABLE Report (
    reportID INT PRIMARY KEY AUTO_INCREMENT,
    generatedBy VARCHAR(20) NOT NULL,
    generatedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reportType ENUM('Daily', 'Weekly', 'Monthly', 'Custom', 'Summary') NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    fileFormat ENUM('PDF', 'Excel', 'CSV') NOT NULL DEFAULT 'PDF',
    filePath VARCHAR(255) NULL,
    recordCount INT NOT NULL DEFAULT 0,
    status ENUM('Generated', 'Processing', 'Failed') NOT NULL DEFAULT 'Processing',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_generatedBy (generatedBy),
    INDEX idx_reportType (reportType),
    INDEX idx_generatedDate (generatedDate),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AUDIT_LOG
-- Security audit trail - tracks all system activities for compliance
CREATE TABLE Audit_Log (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    userID VARCHAR(20) NOT NULL,
    userType ENUM('Student', 'Teacher', 'Admin', 'Parent') NOT NULL,
    action VARCHAR(100) NOT NULL,
    tableName VARCHAR(50) NULL,
    recordID VARCHAR(50) NULL,
    ipAddress VARCHAR(45) NULL ,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Success', 'Failed', 'Warning') NOT NULL DEFAULT 'Success',
    details TEXT NULL,
    
    INDEX idx_userID (userID),
    INDEX idx_userType (userType),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action),
    INDEX idx_tableName (tableName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------- --
-- PERFORMANCE OPTIMIZATION INDEXES
-- ----------------------------------------------------------- --

-- Additional composite indexes for complex queries
CREATE INDEX idx_attendance_student_course ON Attendance(studentID, courseID);
CREATE INDEX idx_notification_parent_date ON Notification(parentID, sentDate);
CREATE INDEX idx_audit_user_timestamp ON Audit_Log(userID, timestamp);

-- ----------------------------------------------------------- --
-- DATABASE MAINTENANCE
-- ----------------------------------------------------------- --
-- Clean old notifications (older than 90 days)
-- DELETE FROM Notification WHERE sentDate < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Archive old audit logs (older than 2 years)
-- DELETE FROM Audit_Log WHERE timestamp < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- Optimize tables
-- OPTIMIZE TABLE Attendance, Notification, Audit_Log;

-- Find locked or inactive student accounts
-- SELECT studentID, CONCAT(firstName, ' ', lastName) as name, accountStatus, lastLogin
-- FROM Student
-- WHERE accountStatus != 'Active'
-- ORDER BY lastLogin DESC;

-- ----------------------------------------------------------- --
-- BACKUP COMMAND (Run from terminal)
-- ----------------------------------------------------------- --
-- mysqldump -u root -p ai_attendance_system > backup_$(date +%Y%m%d).sql

SHOW TABLES;
SELECT * FROM Attendance;

INSERT INTO Student (studentID, firstName, lastName, email, passwordHash, accountStatus, course, yearLevel)
VALUES ('2025-001', 'Annie', 'Dev', 'annie@example.com', 'hashedpw', 'Active', 'CS101', 3);

INSERT INTO Course (courseCode, courseID, courseName, description)
VALUES ('CS101-A', 'CS101', 'Introduction to Computer Science', 'Basic CS fundamentals');

ALTER TABLE Course ADD COLUMN yearLevel INT NOT NULL DEFAULT 1;
