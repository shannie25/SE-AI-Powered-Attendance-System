/*// controllers/recognitionController.js - COMPLETE WITH DATABASE
const db = require('../config/db');
const path = require('path');
const { spawn } = require('child_process');

// =====================================================
// FACE RECOGNITION - Process uploaded image
// =====================================================
exports.recognizeFace = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        recognized: false,
        message: 'No image uploaded' 
      });
    }

    const imagePath = path.join(__dirname, '../uploads', req.file.filename);
    const courseID = req.body.courseID;
    const threshold = parseFloat(req.body.threshold) || 0.6;

    console.log('Processing face recognition:', {
      imagePath,
      courseID,
      threshold
    });

    // For now, we'll use a simulated recognition
    // In production, you would call your Python face recognition script here
    // const recognitionResult = await runPythonRecognition(imagePath, threshold);

    // SIMULATED RECOGNITION (Replace with actual Python script)
    // This simulates finding Student 1 (Jane Doe)
    const simulatedRecognition = {
      recognized: true,
      studentID: '2023012345', //Annie's ID
      confidence: 0.95
    };

    if (!simulatedRecognition.recognized) {
      return res.json({
        success: false,
        recognized: false,
        message: 'Face not recognized. Please try again.'
      });
    }

    // Fetch student details
    const [students] = await db.execute(
      'SELECT * FROM Student WHERE studentID = ? LIMIT 1',
      [simulatedRecognition.studentID]
    );

    if (students.length === 0) {
      return res.json({
        success: false,
        recognized: false,
        message: 'Student not found in database.'
      });
    }

    const student = students[0];

    // Check if course is provided
    if (!courseID) {
      return res.json({
        success: true,
        recognized: true,
        studentID: student.studentID,
        studentName: `${student.firstName} ${student.lastName}`,
        confidence: simulatedRecognition.confidence,
        status: 'Present',
        message: 'Student recognized! Please select a course to mark attendance.'
      });
    }

    // Check if attendance already marked for today
    const today = new Date().toISOString().split('T')[0];
    const [existingAttendance] = await db.execute(
      `SELECT * FROM Attendance 
       WHERE studentID = ? AND courseID = ? AND DATE(date) = ? LIMIT 1`,
      [student.studentID, courseID, today]
    );

    if (existingAttendance.length > 0) {
      return res.json({
        success: true,
        recognized: true,
        studentID: student.studentID,
        studentName: `${student.firstName} ${student.lastName}`,
        confidence: simulatedRecognition.confidence,
        status: existingAttendance[0].status,
        message: 'Attendance already marked for today.',
        alreadyMarked: true
      });
    }

    // Mark attendance
    const currentTime = new Date();
    const timeString = currentTime.toTimeString().split(' ')[0];

    await db.execute(
      `INSERT INTO Attendance 
       (studentID, courseID, date, status, checkInTime, recognitionConfidence)
       VALUES (?, ?, ?, 'Present', ?, ?)`,
      [student.studentID, courseID, today, timeString, simulatedRecognition.confidence]
    );

    // Success response
    return res.json({
      success: true,
      recognized: true,
      studentID: student.studentID,
      studentName: `${student.firstName} ${student.lastName}`,
      course: student.course,
      yearLevel: student.yearLevel,
      confidence: simulatedRecognition.confidence,
      status: 'Present',
      message: 'Attendance marked successfully!'
    });

  } catch (error) {
    console.error('Recognition error:', error);
    return res.status(500).json({
      success: false,
      recognized: false,
      message: 'Server error during recognition.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// GET ACTIVE COURSES - For dropdown
// =====================================================
exports.getActiveCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(
      `SELECT c.courseID, c.courseCode, c.courseName, 
              CONCAT(t.firstName, ' ', t.lastName) as teacherName
       FROM Course c
       LEFT JOIN Teacher t ON c.teacherID = t.teacherID
       WHERE c.isActive = TRUE
       ORDER BY c.courseCode`
    );

    return res.json({
      ok: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Failed to fetch courses.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// HELPER: Run Python Recognition Script (Optional)
// =====================================================
async function runPythonRecognition(imagePath, threshold) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../python/live_recognition.py');
    const python = spawn('python', [pythonScript, imagePath, threshold]);

    let stdoutData = '';
    let stderrData = '';

    python.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderrData}`));
        return;
      }

      try {
        const result = JSON.parse(stdoutData.trim());
        resolve(result);
      } catch (error) {
        reject(new Error('Failed to parse Python output'));
      }
    });
  });
}

module.exports = {
  recognizeFace: exports.recognizeFace,
  getActiveCourses: exports.getActiveCourses
};
*/
// controllers/recognitionController.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const attendanceController = require('./attendanceController');

exports.recognizeFace = async (req, res) => {
  try {
    const { courseID, threshold = 0.6 } = req.body;

    if (!req.file) {
      return res.json({
        success: false,
        recognized: false,
        message: 'No image received'
      });
    }

    // 1️⃣ CHECK: Are there registered faces?
    const [registeredFaces] = await db.query(
      'SELECT studentID, embedding FROM face_data'
    );

    if (!registeredFaces || registeredFaces.length === 0) {
      fs.unlink(req.file.path, () => {});
      return res.json({
        success: false,
        recognized: false,
        message: 'No registered faces in the system'
      });
    }

    // 2️⃣ Run Python recognition (SCAN ONLY)
    const python = spawn('python', [
      path.join(__dirname, '../python/recognize_face.py'),
      req.file.path
    ]);

    let output = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.on('close', async () => {
      // delete scan image for privacy
      fs.unlink(req.file.path, () => {});

      let match;
      try {
        match = JSON.parse(output);
      } catch (e) {
        return res.json({
          success: false,
          recognized: false,
          message: 'Invalid recognition response'
        });
      }

      // 3️⃣ STRICT VALIDATION
      if (
        !match ||
        !match.studentID ||
        match.confidence < parseFloat(threshold)
      ) {
        return res.json({
          success: false,
          recognized: false,
          message: 'Face not recognized'
        });
      }

      // 4️⃣ LOG ATTENDANCE (ONLY IF VALID)
      const result = await attendanceController.logAttendance(
        match.studentID,
        courseID,
        'Present',
        match.confidence
      );

      return res.json({
        success: true,
        recognized: true,
        studentID: match.studentID,
        studentName: match.studentName,
        confidence: match.confidence,
        alreadyMarked: result.alreadyMarked || false
      });
    });

  } catch (err) {
    console.error('Recognition error:', err);
    res.status(500).json({
      success: false,
      recognized: false,
      message: 'Server error'
    });
  }
};

// GET active courses for scanner dropdown
exports.getActiveCourses = async (req, res) => {
  try {
    const db = require('../config/db');

    const [courses] = await db.query(
      'SELECT courseID, courseCode, courseName FROM Course'
    );

    res.json({
      ok: true,
      courses
    });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
};

