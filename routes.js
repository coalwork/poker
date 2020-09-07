const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.use(({ path }, res, next) => {
  if (/\.template\.html/.test(path)) {
    return res.status(404).end();
  }
  next();
});

router.use(async (req, res, next) => {
  const filename = (req.path.match(/\/(.*)\.html/) || [])[1];
  const htmlName = filename + '.template.html';

  if (!fs.existsSync(path.join('public', htmlName))) { return next(); }

  const file = fs.readFileSync(path.join('public', htmlName)).toString();
  const regex = /<head>(?<head>[\s\S]*)<\/head>[\s\S]*<body>(?<body>[\s\S]*)<\/body>/;
  const { head, body } = file.match(regex).groups;
  const templatedFile = fs.readFileSync(path.join('public', 'template.html'))
    .toString()
    .replace('<!-- ##HEAD -->', head.trim())
    .replace('<!-- ##BODY -->', body.trim())
  ;

  res.send(templatedFile);
});

router.get('/', (_, res) => res.redirect('/index.html'));

router.use(express.static(path.join(__dirname, 'public')));

module.exports = router;
