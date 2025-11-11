const express = require('express');
const router = express.Router();
const { recognizeFace } = require('../controllers/recognitionController');

router.post('/image', (req, res) => {
  const { imageData } = req.body;
  const result = recognizeFace(imageData);

  if (!result) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  res.json({ success: true, result });
});

module.exports = router;