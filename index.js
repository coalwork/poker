const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 23795;

const ignoredPaths = [
  '/template.html'
];

app.use((req, res, next) => {
  if (ignoredPaths.includes(req.path)) {
    res.status(404).redirect('/404');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is listening on port ${PORT}`);
});
