const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
