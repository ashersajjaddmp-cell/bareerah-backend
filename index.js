const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ status: "Backend running" });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});
