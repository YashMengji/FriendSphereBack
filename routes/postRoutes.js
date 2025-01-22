const express = require("express");
const upload = require("../config/cloudinary");
const { isLoggedIn } = require("../middlewares/authMiddlewares");
const { getAllPosts, getSinglePost, createComment, updateComment, deleteComment, createPost, deleteAll, deleteSinglePost, toggleCommentLike } = require("../controllers/postControllers");

const router = express.Router();

router.get("/", isLoggedIn, getAllPosts);
router.post("/", isLoggedIn, upload.single("image"), createPost); 
// router.get("/:id", isLoggedIn, getSinglePost);
router.post("/:id/comments", isLoggedIn, createComment);
router.put("/:postId/comments/:commentId", isLoggedIn, updateComment);
router.delete("/:postId/comments/:commentId", isLoggedIn, deleteComment);
router.delete("/:postId", isLoggedIn, deleteSinglePost);
router.get("/deleteAll", deleteAll)
router.post("/:postId/comments/:commentId/toggleLike", isLoggedIn, toggleCommentLike)

module.exports = router;