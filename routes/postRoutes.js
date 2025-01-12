const express = require("express");
const upload = require("../config/cloudinary");
const { isLoggedIn } = require("../middlewares/authMiddlewares");
const { getAllPosts, getSinglePost, createComment, updateComment, deleteComment, createPost } = require("../controllers/postControllers");

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", isLoggedIn, upload.single("image"), createPost); 
router.get("/:id", getSinglePost);
router.post("/:id/comments", isLoggedIn, createComment);
router.put("/:postId/comments/:commentId", updateComment);
router.delete("/:postId/comments/:commentId", deleteComment);

module.exports = router;