const express = require("express");
require("dotenv").config()
const userModel = require("./models/users");
const crypto = require("crypto");
const bcrypt = require("bcrypt"); //For encryption of passwords
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser")

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Home page");
})

app.post("/register", async (req, res) => {
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

    console.log(user);
    return res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});

app.post("/login", async (req, res) => {
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
});

app.get("/users", async (req, res) => {
  try {
    const users = await userModel.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

app.post("/sendRequest", isLoggedIn, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.signData.userId;

    const sender = await userModel.findById(senderId);
    sender.friendRequestsSent.push(receiverId);
    await sender.save(); 

    const receiver = await userModel.findById(receiverId);
    receiver.friendRequestsReceived.push(senderId);
    await receiver.save();
    
    res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

app.post("/acceptRequest", isLoggedIn, async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.signData.userId;

    const receiver = await userModel.findById(receiverId);
    const sender = await userModel.findById(senderId);

    receiver.friends.push(senderId);
    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(id => id != senderId);
    await receiver.save();

    sender.friends.push(receiverId);
    sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id != receiverId);
    await sender.save();

    res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

app.post("/rejectRequest", isLoggedIn, async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.signData.userId;

    const receiver = await userModel.findById(receiverId);
    const sender = await userModel.findById(senderId);

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(id => id != senderId);
    await receiver.save();

    sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id != receiverId);
    await sender.save();

    res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

app.post("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    return res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

function isLoggedIn(req, res, next) {
  const signData = jwt.verify(req.cookies.token, process.env.ENCRYPT_STRING);
  req.signData = signData;
  next();
}

app.post("/unFriend", isLoggedIn, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.signData.userId;

    const sender = await userModel.findById(senderId);
    const receiver = await userModel.findById(receiverId);
    
    sender.friends = sender.friends.filter(id => id != receiverId);
    await sender.save();

    receiver.friends = receiver.friends.filter(id => id != senderId);
    await receiver.save();

    res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
})


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});