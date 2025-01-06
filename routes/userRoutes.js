const express = require("express");
const { getUsers, sendRequest, acceptRequest, rejectRequest, unFriend, removeRequest, editUser } = require("../controllers/userControllers");
const { isLoggedIn } = require("../middlewares/authMiddlewares");
const upload = require("../config/cloudinary");

const router = express.Router();

router.get("/users", getUsers);
router.post("/sendRequest", isLoggedIn, sendRequest);
router.post("/acceptRequest", isLoggedIn, acceptRequest);
router.post("/rejectRequest", isLoggedIn, rejectRequest);
router.post("/unFriend", isLoggedIn, unFriend);
router.post("/removeRequest", isLoggedIn, removeRequest);
router.put("/editUser", isLoggedIn, upload.single('image'), editUser);

module.exports = router;