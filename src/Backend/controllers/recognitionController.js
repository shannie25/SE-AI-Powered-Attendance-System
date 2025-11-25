const { logAttendance } = require('./attendanceController');
const { findStudentById, getStudents } = require('./studentController');

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

function recognizeFace(embedding) {
  const mockResult = {
    recognized: true,
    name: 'Student A',
    confidence: 0.92,
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
  };

  const students = getStudents();
  const student = students.find(s => s.name === mockResult.name);

  if (student && mockResult.confidence >= 0.85) {
    logAttendance(student.id, student.name);
  }

  return mockResult;
}

function recognizeStudent(studentId) {
  const student = findStudentById(studentId);
  if (!student) return null;

  logAttendance(studentId, student.name);
  return {
    recognized: true,
    name: student.name,
    confidence: 1.0,
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
  };
}

module.exports = { recognizeFace, recognizeStudent };