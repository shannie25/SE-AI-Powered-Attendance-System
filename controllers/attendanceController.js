const db = require('../config/db');

async function logAttendance(studentID, courseID, status = 'Present', confidence = null) {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().split(' ')[0];

  const query = `
    INSERT INTO Attendance (studentID, courseID, date, timeIn, status, confidence, verificationMethod)
    VALUES (?, ?, ?, ?, ?, ?, 'Facial Recognition')
    ON DUPLICATE KEY UPDATE 
      timeOut = VALUES(timeIn),
      status = VALUES(status),
      confidence = VALUES(confidence),
      updatedAt = CURRENT_TIMESTAMP
  `;

  try {
    const [results] = await db.execute(query, [studentID, courseID, today, now, status, confidence]);
    return { success: true, id: results.insertId };
  } catch (err) {
    throw err;
  }
}

async function getAttendance() {
  try {
    const [results] = await db.execute('SELECT * FROM Attendance');
    return results;
  } catch (err) {
    throw err;
  }
}

async function getAttendanceByStudentId(studentID) {
  try {
    const [results] = await db.execute('SELECT * FROM Attendance WHERE studentID = ?', [studentID]);
    return results;
  } catch (err) {
    throw err;
  }
}

async function getAttendanceByCourseId(courseID) {
  const [rows] = await db.query(
    `SELECT a.attendanceID, a.studentID, s.firstName, s.lastName,
            a.courseID, c.courseName,
            a.status, a.confidence, a.date, a.timeIn, a.timeOut, a.createdAt, a.updatedAt
     FROM Attendance a
     JOIN Student s ON a.studentID = s.studentID
     JOIN Course c ON a.courseID = c.courseID
     WHERE a.courseID = ?
     ORDER BY a.date DESC, a.timeIn DESC`,
    [courseID]
  );
  return rows;
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-PH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

async function getTodayLogs() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const [results] = await db.execute('SELECT * FROM Attendance WHERE date = ?', [today]);
    return results;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  logAttendance,
  getAttendance,
  getAttendanceByStudentId,
  getAttendanceByCourseId,
  getTodayLogs
};