const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', (req, res) => {
  const students = studentController.getStudents();
  res.json(students);
});

module.exports = router;