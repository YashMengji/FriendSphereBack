function isLoggedIn(req, res, next) {
  const signData = jwt.verify(req.cookies.token, process.env.ENCRYPT_STRING);
  req.signData = signData;
  next();
}

module.exports = { isLoggedIn };