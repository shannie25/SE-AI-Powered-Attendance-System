const express = require('express');
const router = express.Router();

const {
  logAttendance,
  getAttendance,
  getAttendanceByStudentId
} = require('../controllers/attendanceController');

const studentController = require('../controllers/studentController');
console.log('🔍 studentController keys:', Object.keys(studentController));

const findStudentById = studentController.findStudentById;

router.post('/', (req, res) => {
  const { studentId } = req.body;
  const student = findStudentById(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const entry = logAttendance(studentId, student.name);
  res.json({ success: true, entry });
});

router.get('/:studentId', (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const logs = getAttendanceByStudentId(studentId);

  if (logs.length === 0) {
    return res.status(404).json({ error: 'No attendance found for this student' });
  }

  res.json(logs);
});

module.exports = router;