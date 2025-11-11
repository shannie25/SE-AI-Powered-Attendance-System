const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Route modules
const studentRoutes = require('./routes/studentRoutes');
console.log('✅ studentRoutes type:', typeof studentRoutes);

const attendanceRoutes = require('./routes/attendanceRoutes');
console.log('✅ attendanceRoutes type:', typeof attendanceRoutes);

const recognitionRoutes = require('./routes/recognitionRoutes');
console.log('✅ recognitionRoutes type:', typeof recognitionRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Face Recognition API is running!');
});

// Modular routes
app.use('/students', studentRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/recognize', recognitionRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});