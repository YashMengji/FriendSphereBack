const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/users");


async function register (req, res) {
  try {
    const {fname, lname, username, password, email} = req.body;
    let user = {};
    
    if(
      await userModel.findOne({username})
    ) {
      return res.status(400).json({ message: "Username is taken" });
    } 
    if(
      await userModel.findOne({email})
    ) {
      console.log("username exists!!")
      return res.status(400).json({ message: "Email already registered" });``
    } 

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
    user = await userModel.create({ fname, lname, username, password: hashedPassword, email });
    const token = jwt.sign({ email, userId: user._id }, process.env.ENCRYPT_STRING);
    res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000 });

    // console.log(user);
    return res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
}

async function login (req, res) {
  try{
    const {username, password} = req.body;
    const user = await userModel.findOne({username});
    if(user == null){
      return res.status(400).json({ message: "User not registerd" });
    }
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        return res.status(500).json({ message: "Error comparing passwords" });
      }
      if(result){
        const token = jwt.sign({email: user.email, userId: user._id}, process.env.ENCRYPT_STRING);
        res.cookie("token", token, {maxAge: 24 * 60 * 60 * 1000});
        return res.send(true);
      }
      else{
        return res.status(400).json({ message: "Password is incorrect" });
      }
    });
  }
  catch(error) {
    return res.status(400).send(error.message);
  }
}

function logout (req, res)  {
  try {
    res.clearCookie("token");
    return res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

module.exports = { register, login, logout };