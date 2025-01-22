const postModel = require('../models/posts.js');
const commentModel = require('../models/comments.js');
const userModel = require('../models/users.js');
const likeModel = require('../models/likes.js'); // For comments likes
const likePostModel = require('../models/likesPost.js'); // For posts likes
const mongoose = require("mongoose");
const storage = require("../config/cloudinary.js")

const COMMENT_SELECT_FIELDS = {
  path: "comments",
  select: "_id message parentId createdAt userId postId",
  options: {
    sort: { createdAt: -1 }
  },
  populate: {
    path: "userId",
    select: "_id username"
  }
}

async function getAllPosts(req, res) {
  try {
    let posts = await postModel.find()
      .select("title body image comments createdAt")
      .populate("userId", "username image") // Populate user details
      .populate(
        COMMENT_SELECT_FIELDS  // Populate user details within comments
      )
      .sort({ createdAt: -1 });

    const userId = req.signData.userId;

    // Fetch all likes related to the current user, on comments in all posts
    const likesByMe = await likeModel.find({
      userId: userId,
      commentId: { $in: posts.flatMap(post => post.comments.map(comment => comment._id)) }
    });
    const allLikes = await likeModel.find();
    posts = posts.map(post => {
      const tailoredComments = post.comments.map(comment => {
        const isLikedByMe = likesByMe.some(like => like.commentId.toString() === comment._id.toString());
        const likeCount = allLikes.filter(like => like.commentId.toString() === comment._id.toString()).length;
        console.log(comment)
        return {
          _id: comment._id,
          message: comment.message,
          parentId: comment.parentId,
          createdAt: comment.createdAt,
          userId: comment.userId,
          postId: comment.postId,
          comments: comment.comments,
          likedByMe: isLikedByMe,
          likeCount: likeCount
        };
      });
      return {
        ...post.toObject(),
        comments: tailoredComments
      };
    });

    const likesByMePost = await likePostModel.find({
      userId: userId,
      postId: { $in: posts.map(post => post._id) }
    });
    const allLikesPost = await likePostModel.find();
    posts = posts.map(post => {
      const likedByMePost = likesByMePost.some(like => like.postId.toString() === post._id.toString());
      const likeCountPost = allLikesPost.filter(like => like.postId.toString() === post._id.toString()).length;
      return {
        ...post,
        likedByMePost: likedByMePost,
        likeCountPost: likeCountPost
      };
    })


    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: "FROM HERE " + error.stack });
  }
}

async function createPost(req, res) {
  try {
    if (req.body.title === "" || req.body.title == null) {
      return res.status(400).json({ message: "Title is required" })
    }
    if (req.body.content === "" || req.body.content == null) {
      return res.status(400).json({ message: "Body is required" })
    }
    let user = await userModel.findOne({ _id: req.signData.userId }); //Take later from cookie
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const postData = {
      title: req.body.title,
      body: req.body.content,
      userId: new mongoose.Types.ObjectId(`${req.signData.userId}`),
    };
    if (req.file?.path !== "" && req.file?.path != null) {
      postData.image = req.file.path
    }
    const post = await postModel.create(postData);
    const populatedPost = await postModel.findById(post._id).populate('userId', 'username image');
    user.posts.push(post._id);
    await user.save();
    return res.status(201).json({
      ...populatedPost.toObject(),
      likedByMePost: false,
      likeCountPost: 0
    });
  } catch (error) {
    return res.status(500).json({ message: error.stack });
  }
}

async function getSinglePost(req, res) {
  try {
    const post = await postModel.findOne({ _id: req.params.id })
      .select("title body")
      .populate(
        COMMENT_SELECT_FIELDS
      );
    return res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.stack });
  }
}

async function createComment(req, res) {
  try {
    if (req.body.message === "" || req.body.message == null) {
      return res.status(400).json({ message: "Message is required" })
    }
    let user = await userModel.findOne({ _id: req.signData.userId }); //Take later from cookie
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const commentData = {
      message: req.body.message,
      userId: new mongoose.Types.ObjectId(`${req.signData.userId}`),
      postId: new mongoose.Types.ObjectId(`${req.params.id}`)
    };
    if (req.body.parentId) {
      commentData.parentId = req.body.parentId;
    }
    const comment = await commentModel.create(commentData);

    if (req.body.parentId) {
      const parentComment = await commentModel.findOne({ _id: req.body.parentId })
      parentComment.comments.push(comment._id)
      await parentComment.save();
    }

    let post = await postModel.findOne({ _id: req.params.id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push(comment._id)
    await post.save()

    user.comments.push(comment._id);
    await user.save();

    const commentPopulate = await commentModel.findOne({ _id: comment._id })
      .select("_id message parentId createdAt userId postId")
      .populate(
        {
          path: "userId",
          select: "username image"
        }
      )

    return res.json({
      ...commentPopulate.toObject(),
      likedByMe: false,
      likeCount: 0
    });
  } catch (error) {
    return res.status(500).json({ message: error.stack });
  }
}

async function updateComment(req, res) {
  try {
    if (req.body.message === "" || req.body.message == null) {
      return res.status(400).json({ message: "Message is required" })
    }
    const updatedComment = await commentModel.findByIdAndUpdate(
      req.params.commentId,
      { message: req.body.message },
      { new: true } // This option returns the updated document
    );
    const commentPopulate = await commentModel.findOne({ _id: updatedComment._id })
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

async function deleteComment(req, res) {
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

async function deleteAll(req, res) {
  try {
    await postModel.deleteMany();
    await commentModel.deleteMany();
    return res.status(200).json({ message: "All posts and comments deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.stack });
  }
}

async function deleteSinglePost(req, res) {
  try {
    const post = await postModel.findByIdAndDelete(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await commentModel.deleteMany({ postId: post._id });
    await userModel.updateOne({ _id: post.userId }, { $pull: { posts: post._id } });
    return res.status(200).json({ message: "Post deleted successfully", _id: post._id });
  } catch (error) {
    return res.status(500).json({ message: error.stack });
  }
}

async function toggleCommentLike(req, res) {
  try{
    const data = { 
      userId: req.signData.userId,
      commentId: req.params.commentId 
    }
    const like = await likeModel.findOne(data);
    if(like==null){
      await likeModel.create(data)
      return res.status(200).json(true);
    }
    else{
      await likeModel.deleteOne(data);
      return res.status(200).json(false);
    }
  }
  catch (error) {
    return res.status(500).json({ message: error.stack });
  }
}

async function togglePostLike(req, res) {
  try{
    const data = { 
      userId: req.signData.userId,
      postId: req.params.postId 
    }
    const like = await likePostModel.findOne(data);
    if(like==null){
      await likePostModel.create(data)
      return res.status(200).json(true);
    }
    else{
      await likePostModel.deleteOne(data);
      return res.status(200).json(false);
    }
  }
  catch (error) {
    return res.status(500).json({ message: error.stack });
  }
}

module.exports = { getAllPosts, getSinglePost, createComment, updateComment, deleteComment, createPost, deleteAll, deleteSinglePost, toggleCommentLike, togglePostLike };