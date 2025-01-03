const express = require("express");
const { getAllPosts, getSinglePost, createComment, updateComment, deleteComment } = require("../controllers/postControllers");

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getSinglePost);
router.post("/:id/comments", createComment);
router.put("/:postId/comments/:commentId", updateComment);
router.delete("/:postId/comments/:commentId", deleteComment);

module.exports = router;