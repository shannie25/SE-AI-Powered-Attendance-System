const path = require('path');
const { spawn } = require('child_process');
const { recognizeFace } = require('./recognitionController');

exports.handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imagePath = path.join(__dirname, '../uploads', req.file.filename);
  console.log('Image saved at:', imagePath);

 const pythonScriptPath = path.join(__dirname, '..', 'python', 'face_embedder.py');
  const python = spawn('python', [pythonScriptPath, imagePath]);

  let stdoutData = '';
  let stderrData = '';

  python.stdout.setEncoding('utf8');
  python.stdout.on('data', (chunk) => {
    console.log('stdout chunk:', JSON.stringify(chunk));
    stdoutData += chunk;
  });

  python.stderr.setEncoding('utf8');
  python.stderr.on('data', (err) => {
    console.error('stderr chunk:', JSON.stringify(err));
    stderrData += err;
  });

  python.on('close', (code) => {
    console.log('Python exited with code:', code);
    console.log('Final stdout:', JSON.stringify(stdoutData));
    console.log('Final stderr:', JSON.stringify(stderrData));

    try {
      const result = JSON.parse(stdoutData.trim());
      if (result && Array.isArray(result.embedding)) {
        const match = recognizeFace(result.embedding);
        res.json({ success: true, match });
      } else {
        res.status(500).json({ error: 'Embedding generation failed or malformed response' });
      }
    } catch (err) {
      console.error('JSON parse error:', err.message);
      res.status(500).json({ error: 'Invalid embedding response', details: err.message });
    }
  });
};

