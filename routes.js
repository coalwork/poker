const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const passport = require('./passport-local');
const path = require('path');
const session = require('express-session');
const LokiStore = require('connect-loki')(session);

const router = express.Router();

router.use(cookieParser());

router.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}));

router.use(passport.initialize());
router.use(passport.session());

// Checks if the template file exists, otherwise return status 404
router.use(({ path }, res, next) => {
  if (/\.?template\.html/.test(path)) {
    return res.status(404).end();
  }
  next();
});

// Parses the template file
router.use((req, res, next) => {
  // I have no idea why I used Promise.resolve().then() here, maybe I'm just dumb
  return Promise.resolve().then(() => {
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
});

router.get('/', (_, res) => res.redirect('/index.html'));

router.post('/login', express.urlencoded({ extended: false }), (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).end();
    }
    if (!user) { return res.status(404).end(); }

    req.logIn(user, (err) => {
      if (err) { return res.status(500).end(); }
      res.status(201).redirect('/');
    });
  })(req, res, next);
});

router.use(express.static(path.join(__dirname, 'public')));

module.exports = router;
