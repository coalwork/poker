const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 23795;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is listening on port ${PORT}`);
});
