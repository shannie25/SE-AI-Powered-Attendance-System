// controllers/studentController.js - COMPLETE WITH ALL ENDPOINTS
const db = require('../config/db');

// =====================================================
// STUDENT SUMMARY - Dashboard Overview
// =====================================================
exports.getStudentSummary = async (req, res) => {
  try {
    const studentID = req.params.id;

    // Get student info
    const [students] = await db.execute(
      'SELECT * FROM Student WHERE studentID = ? LIMIT 1',
      [studentID]
    );

    if (students.length === 0) {
      return res.json({ ok: false, msg: 'Student not found.' });
    }

    const student = students[0];

    // Get attendance statistics
    const [attendanceStats] = await db.execute(
      `SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentCount,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateCount,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentCount,
        ROUND(
          (SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / 
          NULLIF(COUNT(*), 0) * 100), 2
        ) as attendanceRate
       FROM Attendance 
       WHERE studentID = ?`,
      [studentID]
    );

    // Get recent attendance (last 10)
    const [recentAttendance] = await db.execute(
      `SELECT 
        a.date,
        a.status,
        a.checkInTime,
        c.courseCode,
        c.courseName
       FROM Attendance a
       LEFT JOIN Course c ON a.courseID = c.courseID
       WHERE a.studentID = ?
       ORDER BY a.date DESC, a.checkInTime DESC
       LIMIT 10`,
      [studentID]
    );

    // Return summary
    res.json({
      ok: true,
      summary: {
        student: {
          studentID: student.studentID,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          course: student.course,
          yearLevel: student.yearLevel,
          section: student.section
        },
        attendanceStats: {
          totalDays: attendanceStats[0].totalDays || 0,
          presentCount: attendanceStats[0].presentCount || 0,
          lateCount: attendanceStats[0].lateCount || 0,
          absentCount: attendanceStats[0].absentCount || 0,
          attendanceRate: attendanceStats[0].attendanceRate || 0
        },
        recentAttendance: recentAttendance
      }
    });
  } catch (err) {
    console.error('getStudentSummary error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// STUDENT ATTENDANCE RECORDS
// =====================================================
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentID = req.params.id;

    const [records] = await db.execute(
      `SELECT 
        a.attendanceID,
        a.date,
        a.status,
        a.checkInTime,
        a.remarks,
        c.courseCode,
        c.courseName,
        CONCAT(t.firstName, ' ', t.lastName) as teacherName
       FROM Attendance a
       LEFT JOIN Course c ON a.courseID = c.courseID
       LEFT JOIN Teacher t ON c.teacherID = t.teacherID
       WHERE a.studentID = ?
       ORDER BY a.date DESC, a.checkInTime DESC`,
      [studentID]
    );

    res.json({
      ok: true,
      records: records
    });
  } catch (err) {
    console.error('getStudentAttendance error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// STUDENT COURSES
// =====================================================
exports.getStudentCourses = async (req, res) => {
  try {
    const studentID = req.params.id;

    // Get student info
    const [students] = await db.execute(
      'SELECT yearLevel FROM Student WHERE studentID = ? LIMIT 1',
      [studentID]
    );

    if (students.length === 0) {
      return res.json({ ok: false, msg: 'Student not found.' });
    }

    // Get courses for student's year level
    const [courses] = await db.execute(
      `SELECT 
        c.courseID,
        c.courseCode,
        c.courseName,
        c.units,
        c.schedule,
        c.room,
        CONCAT(t.firstName, ' ', t.lastName) as teacherName
       FROM Course c
       LEFT JOIN Teacher t ON c.teacherID = t.teacherID
       WHERE c.yearLevel = ? AND c.isActive = TRUE
       ORDER BY c.courseCode`,
      [students[0].yearLevel]
    );

    res.json({
      ok: true,
      courses: courses
    });
  } catch (err) {
    console.error('getStudentCourses error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// CHECK SCANNER ACCESS
// =====================================================
exports.checkScannerAccess = async (req, res) => {
  try {
    const studentID = req.params.id;

    // Check if student exists
    const [students] = await db.execute(
      'SELECT yearLevel FROM Student WHERE studentID = ? LIMIT 1',
      [studentID]
    );

    if (students.length === 0) {
      return res.json({ ok: false, msg: 'Student not found.' });
    }

    // Get courses where scanning is enabled
    const [activeCourses] = await db.execute(
      `SELECT 
        c.courseID,
        c.courseCode,
        c.courseName,
        c.scannerEnabled,
        CONCAT(t.firstName, ' ', t.lastName) as teacherName
       FROM Course c
       LEFT JOIN Teacher t ON c.teacherID = t.teacherID
       WHERE c.yearLevel = ? 
         AND c.isActive = TRUE 
         AND c.scannerEnabled = TRUE`,
      [students[0].yearLevel]
    );

    res.json({
      ok: true,
      scannerEnabled: activeCourses.length > 0,
      activeCourses: activeCourses
    });
  } catch (err) {
    console.error('checkScannerAccess error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

module.exports = exports;