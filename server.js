require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();

const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const parentRoutes = require('./routes/parentRoutes');
const recognitionRoutes = require('./routes/recognitionRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');


/* =========================
   MIDDLEWARE 
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500'
  ],
  credentials: true
}));

/* =========================
   DEBUG LOGGER (IMPORTANT)
========================= */
app.use((req, res, next) => {
  console.log('➡️', req.method, req.url);
  console.log('📦 Body:', req.body);
  next();
});

/* =========================
   ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/recognition', recognitionRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

/* =========================
   TEST ROUTE
========================= */
app.get('/api', (req, res) => {
  res.json({ ok: true, msg: 'EduFace API is running' });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
========================================
🎓 EduFace Server Started!
========================================
✅ Server running at: http://localhost:${PORT}
✅ API available at: http://localhost:${PORT}/api
========================================
`);
});
