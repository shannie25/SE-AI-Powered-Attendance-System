const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'attendance_system'
});

router.get('/', (req, res) => {
  conn.query('SELECT * FROM Student', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


router.get('/:studentID', (req, res) => {
  conn.query('SELECT * FROM Student WHERE studentID = ?', [req.params.studentID], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});


router.post('/', (req, res) => {
  const { studentID, firstName, lastName, email, passwordHash, course, yearLevel, section } = req.body;
  conn.query(
    'INSERT INTO Student (studentID, firstName, lastName, email, passwordHash, course, yearLevel, section) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [studentID, firstName, lastName, email, passwordHash, course, yearLevel, section],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ success: true, id: studentID });
    }
  );
});

module.exports = router;