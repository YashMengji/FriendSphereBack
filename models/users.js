const mongoose = require("mongoose");
require("dotenv").config();

// mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
mongoose.connect("mongodb+srv://yash:Yash123@cluster0.jia8s2u.mongodb.net/friend_sphere?retryWrites=true&w=majority&appName=Cluster0");

const userSchema = mongoose.Schema({
  fname: {
    type: String, 
    required: true 
  },
  lname: {
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    unique: true, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  }, // Store hashed password
  friends: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // List of friends (references to other users)
  friendRequestsSent: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // List of users to whom friend requests have been sent
  friendRequestsReceived: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // List of users who sent friend requests
  interests: [String], //  List of interests 
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
})

module.exports = mongoose.model("User", userSchema);