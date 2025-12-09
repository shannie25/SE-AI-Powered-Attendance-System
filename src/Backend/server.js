const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // allow frontend requests from other origins

// Import route modules
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const recognitionRoutes = require('./routes/recognitionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Root endpoint
app.get('/', (req, res) => {
  res.send('Face Recognition Attendance API is running');
});

// Mount routes
app.use('/students', studentRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/recognize', recognitionRoutes);
app.use('/upload', uploadRoutes);

// Health check endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Global error handler (optional, catches unhandled errors)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});