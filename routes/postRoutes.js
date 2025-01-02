const express = require("express");
const { getAllPosts, getSinglePost, createComment, updateComment, deleteComment } = require("../controllers/postControllers");

const router = express.Router();

router.get("/", getAllPosts);
router.get("/posts/:id", getSinglePost);
router.post("/posts/:id/comments", createComment);
router.put("/posts/:postId/comments/:commentId", updateComment);
router.delete("/posts/:postId/comments/:commentId", deleteComment);

module.exports = router;