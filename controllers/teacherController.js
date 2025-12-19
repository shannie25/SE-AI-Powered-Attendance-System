// controllers/teacherController.js - COMPLETE WITH SCANNER TOGGLE
const db = require('../config/db');

// =====================================================
// TEACHER SUMMARY - Dashboard Overview
// =====================================================
exports.getTeacherSummary = async (req, res) => {
  try {
    const teacherID = req.params.id;

    // Get teacher info
    const [teachers] = await db.execute(
      'SELECT * FROM Teacher WHERE teacherID = ? LIMIT 1',
      [teacherID]
    );

    if (teachers.length === 0) {
      return res.json({ ok: false, msg: 'Teacher not found.' });
    }

    const teacher = teachers[0];

    // Get courses taught by this teacher
    const [courses] = await db.execute(
      `SELECT 
        c.courseID,
        c.courseCode,
        c.courseName,
        c.schedule,
        c.room,
        c.scannerEnabled,
        COUNT(DISTINCT e.studentID) as studentCount
       FROM Course c
       LEFT JOIN Enrollment e ON c.courseID = e.courseID
       WHERE c.teacherID = ? AND c.isActive = TRUE
       GROUP BY c.courseID
       ORDER BY c.courseCode`,
      [teacherID]
    );

    // Get total student count
    const totalStudents = courses.reduce((sum, course) => sum + (course.studentCount || 0), 0);

    // Get classes today (simplified - you can add schedule logic)
    const todayClasses = courses.length;

    res.json({
      ok: true,
      summary: {
        teacher: {
          teacherID: teacher.teacherID,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          department: teacher.department
        },
        totalCourses: courses.length,
        totalStudents: totalStudents,
        todayClasses: todayClasses,
        courses: courses
      }
    });
  } catch (err) {
    console.error('getTeacherSummary error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// TEACHER COURSES
// =====================================================
exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherID = req.params.id;

    const [courses] = await db.execute(
      `SELECT 
        c.courseID,
        c.courseCode,
        c.courseName,
        c.units,
        c.schedule,
        c.room,
        c.semester,
        c.schoolYear,
        c.scannerEnabled,
        COUNT(DISTINCT e.studentID) as studentCount
       FROM Course c
       LEFT JOIN Enrollment e ON c.courseID = e.courseID
       WHERE c.teacherID = ? AND c.isActive = TRUE
       GROUP BY c.courseID
       ORDER BY c.courseCode`,
      [teacherID]
    );

    res.json({
      ok: true,
      courses: courses
    });
  } catch (err) {
    console.error('getTeacherCourses error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// TEACHER STUDENTS
// =====================================================
exports.getTeacherStudents = async (req, res) => {
  try {
    const teacherID = req.params.id;

    // Get all students enrolled in teacher's courses
    const [students] = await db.execute(
      `SELECT DISTINCT
        s.studentID,
        s.firstName,
        s.lastName,
        s.email,
        s.course,
        s.yearLevel,
        s.section,
        s.accountStatus
       FROM Student s
       INNER JOIN Enrollment e ON s.studentID = e.studentID
       INNER JOIN Course c ON e.courseID = c.courseID
       WHERE c.teacherID = ? AND c.isActive = TRUE
       ORDER BY s.lastName, s.firstName`,
      [teacherID]
    );

    res.json({
      ok: true,
      students: students
    });
  } catch (err) {
    console.error('getTeacherStudents error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// TEACHER ATTENDANCE RECORDS
// =====================================================
exports.getTeacherAttendance = async (req, res) => {
  try {
    const teacherID = req.params.id;

    const [records] = await db.execute(
      `SELECT 
        a.attendanceID,
        a.date,
        a.status,
        a.checkInTime,
        a.studentID,
        CONCAT(s.firstName, ' ', s.lastName) as studentName,
        c.courseCode,
        c.courseName
       FROM Attendance a
       INNER JOIN Course c ON a.courseID = c.courseID
       INNER JOIN Student s ON a.studentID = s.studentID
       WHERE c.teacherID = ?
       ORDER BY a.date DESC, a.checkInTime DESC
       LIMIT 100`,
      [teacherID]
    );

    res.json({
      ok: true,
      records: records
    });
  } catch (err) {
    console.error('getTeacherAttendance error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// TOGGLE SCANNER FOR COURSE
// =====================================================
exports.toggleScanner = async (req, res) => {
  try {
    const { courseID } = req.params;
    const { enabled } = req.body;

    // Verify teacher owns this course
    const teacherID = req.body.teacherID || req.params.id;
    
    const [courses] = await db.execute(
      'SELECT * FROM Course WHERE courseID = ? AND teacherID = ? LIMIT 1',
      [courseID, teacherID]
    );

    if (courses.length === 0) {
      return res.json({ 
        ok: false, 
        msg: 'Course not found or you do not have permission.' 
      });
    }

    // Update scanner status
    await db.execute(
      'UPDATE Course SET scannerEnabled = ? WHERE courseID = ?',
      [enabled ? 1 : 0, courseID]
    );

    res.json({
      ok: true,
      msg: `Scanner ${enabled ? 'enabled' : 'disabled'} successfully.`,
      scannerEnabled: enabled
    });
  } catch (err) {
    console.error('toggleScanner error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// GET COURSE SCANNER STATUS
// =====================================================
exports.getScannerStatus = async (req, res) => {
  try {
    const { courseID } = req.params;

    const [courses] = await db.execute(
      'SELECT scannerEnabled FROM Course WHERE courseID = ? LIMIT 1',
      [courseID]
    );

    if (courses.length === 0) {
      return res.json({ ok: false, msg: 'Course not found.' });
    }

    res.json({
      ok: true,
      scannerEnabled: courses[0].scannerEnabled === 1
    });
  } catch (err) {
    console.error('getScannerStatus error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};





module.exports = exports;