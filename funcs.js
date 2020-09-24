const exported = {};

exported.validateUser = function ({ username = '', password = '' }) {
  username = username.replace(/^"/, '').replace(/"$/, '');

  let reason;
  switch (true) {
    case username.length === 0:
      reason = 'Username must be present.';
      break;
    case username.replace(/\s/g).length === 0:
      reason = 'Username may not only contain whitespace.';
      break;
    case username.length < 3:
      reason = 'Username may not be shorter than 3 characters.';
      break;
    case username.length > 16:
      reason = 'Username may not exceed 16 characters.';
      break;
    case password.length === 0:
      reason = 'Password must be present.';
      break;
    case password.length > 128:
      reason = 'Password may not exceed 128 characters.'
      break;
    default:
      return { valid: true };
  }
  return { valid: false, reason };
}

module.exports = exported;
