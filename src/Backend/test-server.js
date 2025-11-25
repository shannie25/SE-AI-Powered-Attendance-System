const express = require('express');
const app = express();
const PORT = 3000;

app.get('/ping', (req, res) => {
  console.log('/ping route hit');
  res.send('pong');
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});