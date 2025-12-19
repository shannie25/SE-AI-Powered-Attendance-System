const bcrypt = require('bcryptjs');
const db = require('../config/db');
const fs = require('fs');

// Validate if student ID exists and is not registered
exports.validateStudentID = async (req, res) => {
    try {
        const { studentID } = req.params;

        // Check if student ID is in valid list
        const [validRows] = await db.execute(
            'SELECT * FROM Valid_Student_ID WHERE studentID = ?',
            [studentID]
        );

        if (validRows.length === 0) {
            return res.json({ 
                ok: false, 
                msg: 'Invalid Student ID. Please contact administration.' 
            });
        }

        // Check if already registered
        if (validRows[0].isRegistered) {
            return res.json({ 
                ok: false, 
                msg: 'This Student ID is already registered.' 
            });
        }

        // Check if pending registration exists
        const [pendingRows] = await db.execute(
            'SELECT * FROM Pending_Registration WHERE studentID = ? AND status = "Pending"',
            [studentID]
        );

        if (pendingRows.length > 0) {
            return res.json({ 
                ok: false, 
                msg: 'Registration already pending approval.' 
            });
        }

        return res.json({ 
            ok: true, 
            msg: 'Student ID is valid',
            studentInfo: {
                firstName: validRows[0].firstName,
                lastName: validRows[0].lastName,
                course: validRows[0].course,
                yearLevel: validRows[0].yearLevel,
                section: validRows[0].section
            }
        });
    } catch (err) {
        console.error('Validation error:', err);
        res.status(500).json({ ok: false, msg: 'Server error' });
    }
};

// Check if email is available
exports.checkEmailAvailable = async (req, res) => {
    try {
        const { email } = req.params;

        // Check in all user tables
        const [studentRows] = await db.execute('SELECT email FROM Student WHERE email = ?', [email]);
        const [parentRows] = await db.execute('SELECT email FROM Parent_Guardian WHERE email = ?', [email]);
        const [teacherRows] = await db.execute('SELECT email FROM Teacher WHERE email = ?', [email]);
        const [adminRows] = await db.execute('SELECT email FROM Admin WHERE email = ?', [email]);
        const [pendingRows] = await db.execute('SELECT email FROM Pending_Registration WHERE email = ?', [email]);

        if (studentRows.length > 0 || parentRows.length > 0 || 
            teacherRows.length > 0 || adminRows.length > 0 || 
            pendingRows.length > 0) {
            return res.json({ ok: false, msg: 'Email already in use' });
        }

        res.json({ ok: true, msg: 'Email available' });
    } catch (err) {
        console.error('Email check error:', err);
        res.status(500).json({ ok: false, msg: 'Server error' });
    }
};

// Register student (pending approval)
exports.registerStudent = async (req, res) => {
    try {
        const { studentID, firstName, lastName, email, password } = req.body;
        const facePhoto = req.file;

        if (!studentID || !firstName || !lastName || !email || !password) {
            return res.status(400).json({ ok: false, msg: 'All fields required' });
        }

        if (!facePhoto) {
            return res.status(400).json({ ok: false, msg: 'Face photo required' });
        }

        // Validate student ID
        const [validRows] = await db.execute(
            'SELECT * FROM Valid_Student_ID WHERE studentID = ? AND isRegistered = FALSE',
            [studentID]
        );

        if (validRows.length === 0) {
            // Delete uploaded file
            fs.unlinkSync(facePhoto.path);
            return res.json({ ok: false, msg: 'Invalid or already registered Student ID' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Read face photo as base64 (or store path)
        const faceData = fs.readFileSync(facePhoto.path, 'base64');

        // Insert into pending registrations
        const [result] = await db.execute(`
            INSERT INTO Pending_Registration 
            (role, studentID, firstName, lastName, email, passwordHash, faceData, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
        `, ['Student', studentID, firstName, lastName, email, passwordHash, faceData]);

        res.json({ 
            ok: true, 
            msg: 'Registration submitted! Please wait for admin approval.',
            registrationID: result.insertId
        });
    } catch (err) {
        console.error('Student registration error:', err);
        res.status(500).json({ ok: false, msg: 'Registration failed' });
    }
};

// Register parent (pending approval)
exports.registerParent = async (req, res) => {
    try {
        const { 
            childStudentID, 
            relationship, 
            contactNumber, 
            firstName, 
            lastName, 
            email, 
            password 
        } = req.body;

        if (!childStudentID || !relationship || !contactNumber || 
            !firstName || !lastName || !email || !password) {
            return res.status(400).json({ ok: false, msg: 'All fields required' });
        }

        // Validate child's student ID
        const [studentRows] = await db.execute(
            'SELECT studentID FROM Student WHERE studentID = ?',
            [childStudentID]
        );

        if (studentRows.length === 0) {
            return res.json({ 
                ok: false, 
                msg: 'Child Student ID not found. Student must register first.' 
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert into pending registrations
        await db.execute(`
            INSERT INTO Pending_Registration 
            (role, childStudentID, relationship, contactNumber, firstName, lastName, email, passwordHash, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `, ['Parent', childStudentID, relationship, contactNumber, firstName, lastName, email, passwordHash]);

        res.json({ 
            ok: true, 
            msg: 'Registration submitted! Please wait for admin approval.' 
        });
    } catch (err) {
        console.error('Parent registration error:', err);
        res.status(500).json({ ok: false, msg: 'Registration failed' });
    }
};