const express = require('express');
const router = express.Router();
const { recognizeFace } = require('../controllers/recognitionController');

router.post('/', (req, res) => {
  const { embedding } = req.body;
  if (!embedding || !Array.isArray(embedding)) {
    return res.status(400).json({ error: 'Invalid embedding' });
  }

  const result = recognizeFace(embedding);
  if (!result) {
    return res.status(404).json({ message: 'No match found' });
  }

  res.json({ success: true, match: result });
});

module.exports = router;