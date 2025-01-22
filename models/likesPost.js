const mongoose = require("mongoose");
require("dotenv").config();

const likeSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }
});

//Create a unique compound index on userId and commentId
likeSchema.index({userId: 1, postId: 1}, {unique: true});

module.exports = mongoose.model("likePost", likeSchema);