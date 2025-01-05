const mongoose = require("mongoose");
const { use } = require("../routes/authRoutes");
require("dotenv").config();

const postSchema = mongoose.Schema({
  title: {
    type: String, 
    required: true 
  },
  body: {
    type: String, 
    required: true 
  },
  image:{
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to handle cascade delete (Here first parameter of mongoose.model() is considered in this.model())
postSchema.pre("remove", async function(next) {
  try {
    await this.model("comment").deleteMany({postId: this._id}); 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("post", postSchema);