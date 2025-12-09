const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const attendanceController = require('../controllers/attendanceController');


router.post('/', (req, res) => {
  const { studentID, courseID } = req.body;

  const py = spawn('python', ['../python/live_deepface.py', studentID]);

  py.stdout.on('data', async (data) => {
    const confidence = parseFloat(data.toString());
    try {
      const result = await attendanceController.logAttendance(studentID, courseID, 'Present', confidence);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  py.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });
});

module.exports = router;