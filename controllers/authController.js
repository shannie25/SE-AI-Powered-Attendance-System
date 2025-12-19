/*/ controllers/authController.js - ALIGNED WITH MAIN SCHEMA
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// =====================================================
// LOGIN - Works with all user types
// =====================================================
exports.login = async (req, res) => {
  try {
    const { emailOrId, password, role } = req.body;
    if (!emailOrId || !password || !role) {
      return res.status(400).json({ ok: false, msg: 'Missing fields.' });
    }

    let table, idField, sql, params;

    if (role === 'Student') {
      table = 'Student';
      idField = 'studentID';
      sql = `SELECT * FROM ${table} WHERE ${idField} = ? OR email = ? LIMIT 1`;
      params = [emailOrId, emailOrId];
    } else if (role === 'Parent') {
      table = 'Parent_Guardian';
      idField = 'parentID';
      sql = `SELECT * FROM ${table} WHERE email = ? LIMIT 1`;
      params = [emailOrId];
    } else if (role === 'Teacher') {
      table = 'Teacher';
      idField = 'teacherID';
      sql = `SELECT * FROM ${table} WHERE ${idField} = ? OR email = ? LIMIT 1`;
      params = [emailOrId, emailOrId];
    } else if (role === 'Admin') {
      table = 'Administrator';
      idField = 'adminID';
      // Admin can login with adminID, username, or email
      sql = `SELECT * FROM ${table} WHERE ${idField} = ? OR username = ? OR email = ? LIMIT 1`;
      params = [emailOrId, emailOrId, emailOrId];
    } else {
      return res.status(400).json({ ok: false, msg: 'Invalid role.' });
    }

    const [rows] = await db.execute(sql, params);
    
    if (rows.length === 0) {
      return res.json({ ok: false, msg: 'Account not found.' });
    }

    const user = rows[0];
    
    // Check if account is active (different field names for different tables)
    if (role === 'Student' || role === 'Parent') {
      if (user.accountStatus !== 'Active') {
        return res.json({ ok: false, msg: 'Account is not active.' });
      }
    } else if (role === 'Teacher' || role === 'Admin') {
      if (!user.isActive) {
        return res.json({ ok: false, msg: 'Account is not active.' });
      }
    }

    // Verify password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.json({ ok: false, msg: 'Invalid password.' });
    }

    // Update last login
    if (role === 'Student' || role === 'Admin') {
      await db.execute(
        `UPDATE ${table} SET lastLogin = NOW() WHERE ${idField} = ?`,
        [user[idField]]
      );
    }

    // Return user info (excluding password)
    const userResponse = {
      id: user[idField],
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role
    };

    // Add role-specific fields
    if (role === 'Admin') {
      userResponse.username = user.username;
      userResponse.accessLevel = user.accessLevel;
    } else if (role === 'Teacher') {
      userResponse.department = user.department;
    } else if (role === 'Student') {
      userResponse.course = user.course;
      userResponse.yearLevel = user.yearLevel;
      userResponse.section = user.section;
    }

    return res.json({
      ok: true,
      msg: 'Login successful.',
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// REGISTRATION - Student & Parent
// =====================================================
exports.register = async (req, res) => {
  try {
    const { 
      role, 
      studentID, 
      firstName, 
      lastName, 
      email, 
      password,
      // Parent-specific
      childStudentID,
      relationship,
      contactNumber,
      // Student-specific
      course,
      yearLevel
    } = req.body;

    if (!role || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ ok: false, msg: 'Missing required fields.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // =========== STUDENT REGISTRATION ===========
    if (role === 'Student') {
      if (!studentID) {
        return res.status(400).json({ ok: false, msg: 'Student ID is required.' });
      }

      // Check if student ID is in the valid list
      const [validID] = await db.execute(
        'SELECT * FROM Valid_Student_ID WHERE studentID = ? LIMIT 1',
        [studentID]
      );

      if (validID.length === 0) {
        return res.json({ 
          ok: false, 
          msg: 'Invalid Student ID. Please contact the administrator.' 
        });
      }

      if (validID[0].isRegistered) {
        return res.json({ 
          ok: false, 
          msg: 'This Student ID has already been registered.' 
        });
      }

      // Check if email already exists
      const [emailExists] = await db.execute(
        'SELECT email FROM Student WHERE email = ? LIMIT 1',
        [email]
      );

      if (emailExists.length > 0) {
        return res.json({ ok: false, msg: 'Email already registered.' });
      }

      // Create pending registration
      const sql = `
        INSERT INTO Pending_Registration
          (role, studentID, firstName, lastName, email, passwordHash, status)
        VALUES
          ('Student', ?, ?, ?, ?, ?, 'Pending')
      `;

      await db.execute(sql, [studentID, firstName, lastName, email, passwordHash]);

      return res.json({ 
        ok: true, 
        msg: 'Registration submitted. Awaiting admin approval.',
        role: 'Student'
      });
    }

    // =========== PARENT REGISTRATION ===========
    if (role === 'Parent') {
      if (!childStudentID || !relationship || !contactNumber) {
        return res.status(400).json({
          ok: false,
          msg: 'Child student ID, relationship, and contact number are required for Parent registration.'
        });
      }

      // Verify child student exists
      const [childExists] = await db.execute(
        'SELECT studentID FROM Student WHERE studentID = ? LIMIT 1',
        [childStudentID]
      );

      if (childExists.length === 0) {
        return res.json({ 
          ok: false, 
          msg: 'Student ID not found. Please verify the student ID.' 
        });
      }

      // Check if email already exists
      const [emailExists] = await db.execute(
        'SELECT email FROM Parent_Guardian WHERE email = ? LIMIT 1',
        [email]
      );

      if (emailExists.length > 0) {
        return res.json({ ok: false, msg: 'Email already registered.' });
      }

      // Create pending registration
      const sql = `
        INSERT INTO Pending_Registration
          (role, childStudentID, firstName, lastName, email, passwordHash, 
           relationship, contactNumber, status)
        VALUES
          ('Parent', ?, ?, ?, ?, ?, ?, ?, 'Pending')
      `;

      await db.execute(sql, [
        childStudentID, firstName, lastName, email, passwordHash,
        relationship, contactNumber
      ]);

      return res.json({ 
        ok: true, 
        msg: 'Registration submitted. Awaiting admin approval.',
        role: 'Parent'
      });
    }

    return res.status(400).json({ ok: false, msg: 'Unsupported role.' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// CHECK STUDENT ID VALIDITY
// =====================================================
exports.checkStudentID = async (req, res) => {
  try {
    const { studentID } = req.body;

    if (!studentID) {
      return res.status(400).json({ ok: false, msg: 'Student ID is required.' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM Valid_Student_ID WHERE studentID = ? LIMIT 1',
      [studentID]
    );

    if (rows.length === 0) {
      return res.json({ 
        ok: false, 
        valid: false,
        msg: 'Invalid Student ID. Please contact the administrator.' 
      });
    }

    if (rows[0].isRegistered) {
      return res.json({ 
        ok: false, 
        valid: false,
        msg: 'This Student ID has already been registered.' 
      });
    }

    return res.json({
      ok: true,
      valid: true,
      studentInfo: {
        firstName: rows[0].firstName,
        lastName: rows[0].lastName,
        course: rows[0].course,
        yearLevel: rows[0].yearLevel,
        section: rows[0].section
      },
      msg: 'Student ID is valid and available for registration.'
    });
  } catch (err) {
    console.error('checkStudentID error:', err);
    return res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};*/

const bcrypt = require('bcrypt');
const db = require('../config/db'); // must connect to database: attendance_system

function badLogin(res) {
  return res.status(401).json({ ok: false, msg: 'Invalid credentials' });
}

exports.login = async (req, res) => {
  try {
    const { emailOrId, password, role } = req.body;

    if (!emailOrId || !password || !role) {
      return res.status(400).json({ ok: false, msg: 'Missing login fields' });
    }

    const r = String(role).trim(); // 'Admin' | 'Teacher' | 'Student' | 'Parent'
    const key = String(emailOrId).trim();

    let sql = '';
    let params = [];

    // ✅ Match your exact schema
    if (r === 'Admin') {
      sql = `
        SELECT adminID AS id, username, email, passwordHash, role, isActive
        FROM Administrator
        WHERE username = ? OR email = ?
        LIMIT 1
      `;
      params = [key, key];
    } else if (r === 'Teacher') {
      sql = `
        SELECT teacherID AS id, email, passwordHash, isActive, department
        FROM Teacher
        WHERE teacherID = ? OR email = ?
        LIMIT 1
      `;
      params = [key, key];
    } else if (r === 'Student') {
      sql = `
        SELECT studentID AS id, email, passwordHash, accountStatus, enrollmentStatus, course, yearLevel, section
        FROM Student
        WHERE studentID = ? OR email = ?
        LIMIT 1
      `;
      params = [key, key];
    } else if (r === 'Parent') {
      sql = `
        SELECT parentID AS id, email, contactNumber, passwordHash, accountStatus, isActive, studentID
        FROM Parent_Guardian
        WHERE email = ? OR contactNumber = ?
        LIMIT 1
      `;
      params = [key, key];
    } else {
      return res.status(400).json({ ok: false, msg: 'Invalid role' });
    }

    const [rows] = await db.query(sql, params);
    if (!rows || rows.length === 0) return badLogin(res);

    const user = rows[0];

    // ✅ Status checks based on your schema
    if (r === 'Admin' || r === 'Teacher') {
      if (user.isActive === 0) {
        return res.status(403).json({ ok: false, msg: 'Account is inactive' });
      }
    }

    if (r === 'Student') {
      if (user.accountStatus && user.accountStatus !== 'Active') {
        return res.status(403).json({ ok: false, msg: `Account is ${user.accountStatus}` });
      }
      if (user.enrollmentStatus && user.enrollmentStatus !== 'Active') {
        return res.status(403).json({ ok: false, msg: `Enrollment is ${user.enrollmentStatus}` });
      }
    }

    if (r === 'Parent') {
      if (user.isActive === 0) {
        return res.status(403).json({ ok: false, msg: 'Account is inactive' });
      }
      if (user.accountStatus && user.accountStatus !== 'Active') {
        return res.status(403).json({ ok: false, msg: `Account is ${user.accountStatus}` });
      }
    }

    // ✅ BCRYPT verify (your passwordHash values are bcrypt hashes)
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return badLogin(res);

    // ✅ Update lastLogin where applicable (matches your schema)
    if (r === 'Admin') {
      await db.query(`UPDATE Administrator SET lastLogin = NOW() WHERE adminID = ?`, [user.id]);
    } else if (r === 'Student') {
      await db.query(`UPDATE Student SET lastLogin = NOW() WHERE studentID = ?`, [user.id]);
    }

    // ✅ Response format expected by your frontend main.js
    return res.json({
      ok: true,
      user: {
        id: user.id,
        role: r,
        email: user.email || null,
        username: user.username || null
      }
    });

  } catch (err) {
    console.error('❌ LOGIN ERROR:', err);
    return res.status(500).json({ ok: false, msg: 'Server error during login' });
  }
};
