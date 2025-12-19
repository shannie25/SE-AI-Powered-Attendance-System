// ============================================================
// adminController.js - COMPLETE WORKING VERSION
// Copy this ENTIRE file to: controllers/adminController.js
// ============================================================

const db = require('../config/db');
const bcrypt = require('bcrypt');

// ============================================================
// DASHBOARD STATS
// ============================================================
exports.getDashboardStats = async (req, res) => {
    try {
        const [students] = await db.query('SELECT COUNT(*) as count FROM Student');
        const [teachers] = await db.query('SELECT COUNT(*) as count FROM Teacher');
        const [courses] = await db.query('SELECT COUNT(*) as count FROM Course');
        
        const [attendance] = await db.query(`
            SELECT 
                COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
                COUNT(*) as total
            FROM Attendance
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);
        
        const rate = attendance[0].total > 0 
            ? Math.round((attendance[0].present / attendance[0].total) * 100)
            : 0;
        
        res.json({
            ok: true,
            stats: {
                totalStudents: students[0].count,
                totalTeachers: teachers[0].count,
                totalCourses: courses[0].count,
                attendanceRate: rate
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

// ============================================================
// STUDENTS
// ============================================================
exports.getStudents = async (req, res) => {
    try {
        const query = `
            SELECT studentID, firstName, lastName, email, 
                   course, yearLevel, accountStatus
            FROM Student
            ORDER BY studentID DESC
        `;
        
        const [students] = await db.query(query);
        
        res.json({
            ok: true,
            students: students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

// ============================================================
// TEACHERS
// ============================================================
exports.getTeachers = async (req, res) => {
    try {
        const query = `
            SELECT teacherID, firstName, lastName, email, 
                   department, phoneNumber, isActive
            FROM Teacher
            ORDER BY teacherID
        `;
        
        const [teachers] = await db.query(query);
        
        res.json({
            ok: true,
            teachers: teachers
        });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

exports.addTeacher = async (req, res) => {
    try {
        const { teacherID, firstName, lastName, email, 
                password, department, phoneNumber } = req.body;
        
        if (!teacherID || !firstName || !lastName || !email || !password || !department) {
            return res.json({ ok: false, msg: 'Missing required fields' });
        }
        
        // Check if teacher ID exists
        const [existingID] = await db.query(
            'SELECT * FROM Teacher WHERE teacherID = ?',
            [teacherID]
        );
        
        if (existingID.length > 0) {
            return res.json({ ok: false, msg: 'Teacher ID already exists' });
        }
        
        // Check if email exists
        const [existingEmail] = await db.query(
            'SELECT * FROM Teacher WHERE email = ?',
            [email]
        );
        
        if (existingEmail.length > 0) {
            return res.json({ ok: false, msg: 'Email already registered' });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Insert teacher
        await db.query(`
            INSERT INTO Teacher 
            (teacherID, firstName, lastName, email, passwordHash,
             department, phoneNumber, isActive)
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
        `, [teacherID, firstName, lastName, email, passwordHash,
            department, phoneNumber || null]);
        
        res.json({
            ok: true,
            msg: 'Teacher created successfully'
        });
    } catch (error) {
        console.error('Add teacher error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

// ============================================================
// COURSES
// ============================================================
exports.getCourses = async (req, res) => {
    try {
        const query = `
            SELECT c.*,
                   CONCAT(t.firstName, ' ', t.lastName) as teacherName
            FROM Course c
            LEFT JOIN Teacher t ON c.teacherID = t.teacherID
            ORDER BY c.courseCode
        `;
        
        const [courses] = await db.query(query);
        
        res.json({
            ok: true,
            courses: courses
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

exports.addCourse = async (req, res) => {
    try {
        const { courseCode, courseName, units, teacherID, yearLevel } = req.body;
        
        if (!courseCode || !courseName || !units || !yearLevel) {
            return res.json({ ok: false, msg: 'Missing required fields' });
        }
        
        // Generate course ID from code
        const courseID = courseCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        // Check if course code exists
        const [existing] = await db.query(
            'SELECT * FROM Course WHERE courseCode = ?',
            [courseCode]
        );
        
        if (existing.length > 0) {
            return res.json({ ok: false, msg: 'Course code already exists' });
        }
        
        await db.query(`
            INSERT INTO Course 
            (courseID, courseName, courseCode, units, teacherID, 
             yearLevel, semester, schoolYear, isActive)
            VALUES (?, ?, ?, ?, ?, ?, '1st', '2024-2025', TRUE)
        `, [courseID, courseName, courseCode, units, 
            teacherID || 'TCH001', yearLevel]);
        
        res.json({
            ok: true,
            msg: 'Course added successfully'
        });
    } catch (error) {
        console.error('Add course error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

// ============================================================
// REGISTRATIONS
// ============================================================
exports.getPendingRegistrations = async (req, res) => {
    try {
        const query = `
            SELECT * FROM Pending_Registration 
            WHERE status = 'Pending'
            ORDER BY submittedAt DESC
        `;
        
        const [registrations] = await db.query(query);
        
        res.json({
            ok: true,
            registrations: registrations
        });
    } catch (error) {
        console.error('Get pending registrations error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

exports.getRegistration = async (req, res) => {
    try {
        const { registrationID } = req.params;
        
        const query = `
            SELECT * FROM Pending_Registration 
            WHERE registrationID = ?
        `;
        
        const [rows] = await db.query(query, [registrationID]);
        
        if (rows.length === 0) {
            return res.json({ ok: false, msg: 'Registration not found' });
        }
        
        res.json({
            ok: true,
            registration: rows[0]
        });
    } catch (error) {
        console.error('Get registration error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

exports.approveRegistration = async (req, res) => {
    try {
        const { registrationID } = req.params;
        const { notes, adminID } = req.body;
        
        // Get registration details
        const [regRows] = await db.query(
            'SELECT * FROM Pending_Registration WHERE registrationID = ?',
            [registrationID]
        );
        
        if (regRows.length === 0) {
            return res.json({ ok: false, msg: 'Registration not found' });
        }
        
        const reg = regRows[0];
        
        if (reg.status !== 'Pending') {
            return res.json({ ok: false, msg: 'Registration already processed' });
        }
        
        if (reg.role === 'Student') {
            // Create student account
            await db.query(`
                INSERT INTO Student 
                (studentID, firstName, lastName, email, passwordHash, 
                 accountStatus, course, yearLevel)
                VALUES (?, ?, ?, ?, ?, 'Active', 'TBD', 1)
            `, [reg.studentID, reg.firstName, reg.lastName, 
                reg.email, reg.passwordHash]);
            
            // Save face data if exists
            if (reg.faceData) {
                await db.query(`
                    INSERT INTO Face_Data (studentID, faceEncoding, captureQuality)
                    VALUES (?, ?, 95.00)
                `, [reg.studentID, reg.faceData]);
            }
            
            // Update Valid_Student_ID
            await db.query(
                'UPDATE Valid_Student_ID SET isRegistered = TRUE WHERE studentID = ?',
                [reg.studentID]
            );
            
        } else if (reg.role === 'Parent') {
            // Create parent account
            await db.query(`
                INSERT INTO Parent_Guardian 
                (studentID, firstName, lastName, relationship, contactNumber,
                 email, passwordHash, accountStatus, createdBy)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?)
            `, [reg.childStudentID, reg.firstName, reg.lastName,
                reg.relationship, reg.contactNumber, reg.email,
                reg.passwordHash, adminID]);
        }
        
        // Update registration status
        await db.query(`
            UPDATE Pending_Registration 
            SET status = 'Approved', 
                reviewedBy = ?, 
                reviewNotes = ?, 
                reviewedAt = NOW()
            WHERE registrationID = ?
        `, [adminID, notes, registrationID]);
        
        res.json({
            ok: true,
            msg: 'Registration approved successfully'
        });
    } catch (error) {
        console.error('Approve registration error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

exports.rejectRegistration = async (req, res) => {
    try {
        const { registrationID } = req.params;
        const { notes, adminID } = req.body;
        
        await db.query(`
            UPDATE Pending_Registration 
            SET status = 'Rejected', 
                reviewedBy = ?, 
                reviewNotes = ?, 
                reviewedAt = NOW()
            WHERE registrationID = ?
        `, [adminID, notes, registrationID]);
        
        res.json({
            ok: true,
            msg: 'Registration rejected'
        });
    } catch (error) {
        console.error('Reject registration error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

// ============================================================
// VALID IDs
// ============================================================
exports.getValidIDs = async (req, res) => {
    try {
        const query = `
            SELECT * FROM Valid_Student_ID 
            ORDER BY addedAt DESC
        `;
        
        const [validIDs] = await db.query(query);
        
        res.json({
            ok: true,
            validIDs: validIDs
        });
    } catch (error) {
        console.error('Get valid IDs error:', error);
        res.json({ ok: false, msg: error.message });
    }
};

exports.addValidID = async (req, res) => {
    try {
        const { studentID, firstName, lastName, course, 
                yearLevel, section, addedBy } = req.body;
        
        if (!studentID || !firstName || !lastName || !course || !yearLevel) {
            return res.json({ ok: false, msg: 'Missing required fields' });
        }
        
        // Check if ID already exists
        const [existing] = await db.query(
            'SELECT * FROM Valid_Student_ID WHERE studentID = ?',
            [studentID]
        );
        
        if (existing.length > 0) {
            return res.json({ ok: false, msg: 'Student ID already exists' });
        }
        
        await db.query(`
            INSERT INTO Valid_Student_ID 
            (studentID, firstName, lastName, course, yearLevel, 
             section, isRegistered, addedBy)
            VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)
        `, [studentID, firstName, lastName, course, 
            yearLevel, section, addedBy]);
        
        res.json({
            ok: true,
            msg: 'Valid ID added successfully'
        });
    } catch (error) {
        console.error('Add valid ID error:', error);
        res.json({ ok: false, msg: error.message });
    }
};