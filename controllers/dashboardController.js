// controllers/dashboardController.js
const db = require('../config/db');

exports.getStudentSummary = async (req, res) => {
  try {
    const { studentID } = req.query;
    if (!studentID) {
      return res.status(400).json({ ok: false, msg: 'studentID is required.' });
    }

    // total, by status
    const [statusRows] = await db.execute(
      `SELECT status, COUNT(*) AS count
       FROM Attendance
       WHERE studentID = ?
       GROUP BY status`,
      [studentID]
    );

    const counts = {
      Present: 0,
      Late: 0,
      Absent: 0,
      Excused: 0
    };
    statusRows.forEach(r => {
      counts[r.status] = Number(r.count);
    });

    const total = counts.Present + counts.Late + counts.Absent + counts.Excused;

    // last 5 records
    const [recentRows] = await db.execute(
      `SELECT date, courseID, status, timeIn, timeOut
       FROM Attendance
       WHERE studentID = ?
       ORDER BY date DESC, timeIn DESC
       LIMIT 5`,
      [studentID]
    );

    return res.json({
      ok: true,
      summary: {
        totalRecords: total,
        ...counts
      },
      recent: recentRows
    });
  } catch (err) {
    console.error('Student summary error:', err);
    return res.status(500).json({ ok: false, msg: 'Internal server error.' });
  }
};
