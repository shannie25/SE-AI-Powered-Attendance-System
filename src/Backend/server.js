const express = require('express');
const app = express();
const PORT = 3000;
console.log('This is the REAL server.js');

app.use(express.json());


const studentRoutes = require('./routes/studentRoutes');
console.log('✅ studentRoutes type:', typeof studentRoutes);
console.log('🔍 studentRoutes keys:', Object.keys(studentRoutes));

const attendanceRoutes = require('./routes/attendanceRoutes');
console.log('✅ attendanceRoutes type:', typeof attendanceRoutes);

const recognitionRoutes = require('./routes/recognitionRoutes');
console.log('✅ recognitionRoutes type:', typeof recognitionRoutes);

const uploadRoutes = require('./routes/uploadRoutes');


app.get('/', (req, res) => {
  res.send('Face Recognition API is running!');
});



app.use('/students', studentRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/recognize', recognitionRoutes);
app.use('/upload', uploadRoutes);

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});