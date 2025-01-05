const express = require("express");
const multer = require("multer"); // Middleware for handling file uploads
const storage = require("../config/cloudinary.js");
const { getAllPosts, getSinglePost, createComment, updateComment, deleteComment, createPost } = require("../controllers/postControllers");

const router = express.Router();

const upload = multer({ storage: storage });

router.get("/", getAllPosts);
router.post("/", upload.single("image"), createPost); 
router.get("/:id", getSinglePost);
router.post("/:id/comments", createComment);
router.put("/:postId/comments/:commentId", updateComment);
router.delete("/:postId/comments/:commentId", deleteComment);

module.exports = router;