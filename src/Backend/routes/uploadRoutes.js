const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { handleUpload } = require('../controllers/uploadController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `face_${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), handleUpload);

module.exports = router;