const postModel = require('../models/posts.js');
const commentModel = require('../models/comments.js');
const userModel = require('../models/users.js');
const mongoose = require("mongoose");

const COMMENT_SELECT_FIELDS = {
  path: "comments",
  select: "_id message parentId createdAt userId",
  options: {
    sort: { createdAt: -1 }
  },
  populate: {
    path: "userId",
    select: "_id username"
  }
}

async function getAllPosts (req, res) {
  try {
    const posts = await postModel.find()
    .select("title body")
    .populate(
      COMMENT_SELECT_FIELDS
    )
    .sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({message: "FROM HERE " + error.stack});
  }
}

async function getSinglePost (req, res)  {
  try {
    const post = await postModel.findOne({ _id: req.params.id })
    .select("title body")
    .populate(
      COMMENT_SELECT_FIELDS
    );
    return res.json(post);
  } catch (error) {
    res.status(500).json({message: error.stack});
  }
}

async function createComment (req, res) {
  try {
    if(req.body.message === "" || req.body.message == null){
      return res.status(400).json({ message: "Message is required" })
    } 
    const commentData = {
      message: req.body.message,
      userId: new mongoose.Types.ObjectId("66db4ebebd2dcd940dedd973"),
      postId: new mongoose.Types.ObjectId(req.params.id)
    };
    if (req.body.parentId) {
      commentData.parentId = req.body.parentId;
    }
    const comment = await commentModel.create(commentData);
    
    if (req.body.parentId) {
      const parentComment = await commentModel.findOne({_id: req.body.parentId})
      parentComment.comments.push(comment._id)
      await parentComment.save();
    }
  
    const commentPopulate = await commentModel.findOne({_id: comment._id})
    .select("_id message parentId createdAt userId")
    .populate(
      {
        path: "userId",
        select: "_id name"
      }
    )
  
  
    let post = await postModel.findOne({_id: req.params.id});
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push(comment._id)
    await post.save()
  
    let user = await userModel.findOne({_id: "66db4ebebd2dcd940dedd973"}); //Take later from cookie
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.comments.push(comment._id);
    await user.save();
    console.log(commentPopulate);
  
    return res.json(commentPopulate);
  } catch (error) {
    return res.status(500).json({ message: error.stack });
  } 
}

async function updateComment (req, res)  {
  try {
    if(req.body.message === "" || req.body.message == null){
      return res.status(400).json({ message: "Message is required" })
    } 
    const updatedComment = await commentModel.findByIdAndUpdate(
      req.params.commentId,
      {message: req.body.message},
      {new: true} // This option returns the updated document
    );
    const commentPopulate = await commentModel.findOne({_id: updatedComment._id})
    .select("_id message parentId createdAt userId")
    .populate(
      {
        path: "userId",
        select: "_id name"
      }
    )
    return res.json(commentPopulate);
  } catch (error) {
    return res.status(400).json({ message: `Error from backend:- ${error.stack}` })
  }
}

async function deleteComment (req, res) {
  try {
    const comment = await commentModel.findByIdAndDelete(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Manually remove references to this comment from related documents
    await Promise.all([
      postModel.updateOne({ _id: comment.postId }, { $pull: { comments: comment._id } }),
      userModel.updateOne({ _id: comment.userId }, { $pull: { comments: comment._id } }),
      commentModel.deleteMany({ parentId: comment._id }),
    ]);

    return res.status(200).json({ message: "Comment deleted successfully", _id: comment._id });
  } catch (error) {
    return res.status(500).json({ message: error.stack });
  }
}

module.exports = { getAllPosts, getSinglePost, createComment, updateComment, deleteComment };