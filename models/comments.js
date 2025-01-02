const mongoose = require("mongoose");
require("dotenv").config();

const commentSchema = mongoose.Schema({
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment"
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment"
  }]
});

// Middleware to handle cascade delete (Here first parameter of mongoose.model() is considered in this.model())
commentSchema.pre("remove", async function(next) {
  try {
    // Remove the comment ID from the associated post's comments array
    await this.model('post').updateOne(
      { _id: this.postId },
      { $pull: { comments: this._id } }
    );

    // Remove the comment ID from the associated user's comments array
    await this.model('user').updateOne(
      { _id: this.userId },
      { $pull: { comments: this._id } }
    );
    
    // Also delete child comments if necessary
    await this.model('comment').deleteMany({ parentId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("comment", commentSchema);