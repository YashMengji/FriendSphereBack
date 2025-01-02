const mongoose = require("mongoose");
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
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment"
    }
  ]
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