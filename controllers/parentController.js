// controllers/parentController.js - COMPLETE
const db = require('../config/db');

// =====================================================
// PARENT SUMMARY - Dashboard Overview
// =====================================================
exports.getParentSummary = async (req, res) => {
  try {
    const parentID = req.params.id;

    // Get parent info and child
    const [parents] = await db.execute(
      `SELECT 
        p.parentID,
        p.firstName,
        p.lastName,
        p.email,
        p.childStudentID,
        p.relationship,
        s.studentID,
        s.firstName as childFirstName,
        s.lastName as childLastName,
        s.course,
        s.yearLevel,
        s.section
       FROM Parent_Guardian p
       LEFT JOIN Student s ON p.childStudentID = s.studentID
       WHERE p.parentID = ? LIMIT 1`,
      [parentID]
    );

    if (parents.length === 0) {
      return res.json({ ok: false, msg: 'Parent not found.' });
    }

    const parent = parents[0];
    const childStudentID = parent.childStudentID;

    // Get child's attendance statistics
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
      [childStudentID]
    );

    // Get recent attendance
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
      [childStudentID]
    );

    res.json({
      ok: true,
      summary: {
        parent: {
          parentID: parent.parentID,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
          relationship: parent.relationship
        },
        child: {
          studentID: parent.studentID,
          firstName: parent.childFirstName,
          lastName: parent.childLastName,
          course: parent.course,
          yearLevel: parent.yearLevel,
          section: parent.section
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
    console.error('getParentSummary error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// CHILD ATTENDANCE RECORDS
// =====================================================
exports.getChildAttendance = async (req, res) => {
  try {
    const parentID = req.params.id;

    // Get child student ID
    const [parents] = await db.execute(
      'SELECT childStudentID FROM Parent_Guardian WHERE parentID = ? LIMIT 1',
      [parentID]
    );

    if (parents.length === 0) {
      return res.json({ ok: false, msg: 'Parent not found.' });
    }

    const childStudentID = parents[0].childStudentID;

    // Get attendance records
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
      [childStudentID]
    );

    res.json({
      ok: true,
      records: records
    });
  } catch (err) {
    console.error('getChildAttendance error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// CHILD COURSES
// =====================================================
exports.getChildCourses = async (req, res) => {
  try {
    const parentID = req.params.id;

    // Get child info
    const [parents] = await db.execute(
      `SELECT p.childStudentID, s.yearLevel
       FROM Parent_Guardian p
       LEFT JOIN Student s ON p.childStudentID = s.studentID
       WHERE p.parentID = ? LIMIT 1`,
      [parentID]
    );

    if (parents.length === 0) {
      return res.json({ ok: false, msg: 'Parent not found.' });
    }

    const yearLevel = parents[0].yearLevel;

    // Get courses
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
      [yearLevel]
    );

    res.json({
      ok: true,
      courses: courses
    });
  } catch (err) {
    console.error('getChildCourses error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

// =====================================================
// PARENT NOTIFICATIONS
// =====================================================
exports.getNotifications = async (req, res) => {
  try {
    const parentID = req.params.id;

    const [notifications] = await db.execute(
      `SELECT 
        notificationID,
        parentID,
        notificationType,
        message,
        sentAt,
        status
       FROM Notification
       WHERE parentID = ?
       ORDER BY sentAt DESC
       LIMIT 50`,
      [parentID]
    );

    res.json({
      ok: true,
      notifications: notifications
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};

module.exports = exports;