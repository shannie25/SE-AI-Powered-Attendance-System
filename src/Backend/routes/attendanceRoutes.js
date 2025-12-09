const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');


router.post('/log', async (req, res) => {
  const { studentID, courseID, status, confidence } = req.body;
  try {
    const result = await attendanceController.logAttendance(studentID, courseID, status, confidence);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Error logging attendance:', err);
    res.status(500).json({ success: false, error: 'Failed to log attendance', details: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const logs = await attendanceController.getAttendance();
    res.json({ success: true, records: logs });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance', details: err.message });
  }
});


router.get('/student/:studentID', async (req, res) => {
  try {
    const logs = await attendanceController.getAttendanceByStudentId(req.params.studentID);
    res.json({ success: true, records: logs });
  } catch (err) {
    console.error(`Error fetching logs for student ${req.params.studentID}:`, err);
    res.status(500).json({ success: false, error: 'Failed to fetch student logs', details: err.message });
  }
});


router.get('/course/:courseID', async (req, res) => {
  try {
    const logs = await attendanceController.getAttendanceByCourseId(req.params.courseID);
    res.json({ success: true, records: logs });
  } catch (err) {
    console.error(`Error fetching logs for course ${req.params.courseID}:`, err);
    res.status(500).json({ success: false, error: 'Failed to fetch course logs', details: err.message });
  }
});

module.exports = router;