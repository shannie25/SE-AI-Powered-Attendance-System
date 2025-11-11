const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const newStudent = { id: Date.now(), name };
  res.json({ success: true, student: newStudent });
});

module.exports = router;