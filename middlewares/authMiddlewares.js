const jwt = require('jsonwebtoken');

function isLoggedIn(req, res, next) {
  try{
    const signData = jwt.verify(req.cookies.token, process.env.ENCRYPT_STRING);
    req.signData = signData;
    next();
  }
  catch(error){
    return res.status(401).json({message: "Unauthorized access"});
  }
}

module.exports = { isLoggedIn };