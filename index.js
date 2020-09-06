const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 23795;
const public = 'public';

app.use(({ path }, res, next) => {
  if (/\.template\.html/.test(path)) {
    return res.status(404).end();
  }
  next();
});

app.use(async (req, res, next) => {
  const filename = (req.path.match(/\/(.*)\.html/) || [])[1];
  const htmlName = filename + '.template.html';

  if (!fs.existsSync(path.join(public, htmlName))) { return next(); }

  const file = fs.readFileSync(path.join(public, htmlName)).toString();
  const regex = /<head>(?<head>[\s\S]*)<\/head>[\s\S]*<body>(?<body>[\s\S]*)<\/body>/;
  const { head, body } = file.match(regex).groups;
  const templatedFile = fs.readFileSync(path.join(public, 'template.html'))
    .toString()
    .replace('<!-- ##HEAD -->', head.trim())
    .replace('<!-- ##BODY -->', body.trim())
  ;

  res.send(templatedFile);
});

app.get('/', (_, res) => res.redirect('/index.html'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is listening on port ${PORT}`);
});
