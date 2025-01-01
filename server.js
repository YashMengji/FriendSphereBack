const express = require("express");
require("dotenv").config()
const userModel = require("./models/users");
const bcrypt = require("bcrypt"); //For encryption of passwords
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

connectDB();

app.use(express.json()); 
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser());
  
app.get("/", (req, res) => {
  res.send("Hello World");
})

app.use("/api/auth", authRoutes);
app.use("/api/u", userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT  || 3000;

app.listen(PORT, () => {
  console.log("Server running on: ", PORT)
});