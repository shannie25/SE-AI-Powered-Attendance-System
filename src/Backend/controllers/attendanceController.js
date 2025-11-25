const fs = require('fs');
const path = require('path');

// File paths
const jsonPath = path.join(__dirname, '../data/attendance.json');
const csvPath = path.join(__dirname, '../data/attendance.csv');

// Load attendance from JSON
function loadAttendance() {
  try {
    const data = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Save attendance to JSON
function saveAttendance(log) {
  fs.writeFileSync(jsonPath, JSON.stringify(log, null, 2));
}

// Append attendance to CSV
function appendToCSV(entry) {
  const header = 'studentId,studentName,timestamp\n';
  const row = `${entry.studentId},${entry.name},"${entry.timestamp}"\n`;

  // Create CSV file with header if it doesn't exist
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, header + row);
  } else {
    fs.appendFile(csvPath, row, (err) => {
      if (err) {
        console.error('❌ Failed to append to CSV:', err.message);
      } else {
        console.log(`✅ CSV log added for ${entry.name}`);
      }
    });
  }
}

let attendanceLog = loadAttendance();

// Log attendance to both JSON and CSV
function logAttendance(studentId, name) {
  const entry = {
    studentId,
    name,
    timestamp: formatTimestamp(new Date().toISOString())
  };
  attendanceLog.push(entry);
  saveAttendance(attendanceLog);
  appendToCSV(entry);
  return entry;
}

// Utility functions
function getAttendance() {
  return attendanceLog;
}

function getAttendanceByStudentId(studentId) {
  return attendanceLog.filter((entry) => entry.studentId === studentId);
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

function getTodayLogs() {
  const today = new Date().toISOString().split('T')[0];
  return attendanceLog.filter(entry => {
    const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
    return entryDate === today;
  });
}

function getStudentLogs(studentId) {
  return attendanceLog.filter(entry => entry.studentId === studentId);
}

module.exports = {
  logAttendance,
  getAttendance,
  getAttendanceByStudentId,
  getTodayLogs,
  getStudentLogs
};