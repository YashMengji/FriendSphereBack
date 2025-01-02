const mongoose = require("mongoose");
require("dotenv").config();

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
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment"
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "like"
  }],
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

userSchema.pre("remove", async function(next) {
  try {
    await this.model("comment").deleteMany({userId: this._id});
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("remove", async function(next) {
  try {
    await this.model("like").deleteMany({userId: this._id});
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);