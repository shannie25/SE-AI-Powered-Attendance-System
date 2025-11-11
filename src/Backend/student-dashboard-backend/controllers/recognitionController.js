const { logAttendance } = require('./attendanceController');
const { findStudentById } = require('./studentController');
const { getStudents } = require('./studentController');

function recognizeFace(imagePath) {
  // You can later use imagePath with OpenCV or face-api.js
  const mockResult = {
    recognized: true,
    name: 'Student A',
    confidence: 0.92,
    timestamp: new Date().toISOString()
  };

  const studentList = getStudents();
  const student = studentList.find(s => s.name === mockResult.name);

  if (student) {
    logAttendance(student.id, student.name);
  }

  return mockResult;
}

function recognizeStudent(studentId) {
  const student = findStudentById(studentId);
  if (!student) return null;

  return logAttendance(studentId, student.name);
}

module.exports = { recognizeFace, recognizeStudent };