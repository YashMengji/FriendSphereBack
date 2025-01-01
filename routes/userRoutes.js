const express = require("express");
const { getUsers, sendRequest, acceptRequest, rejectRequest, unFriend } = require("../controllers/userControllers");
const { isLoggedIn } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.get("/users", getUsers);
router.post("/sendRequest", isLoggedIn, sendRequest);
router.post("/acceptRequest", isLoggedIn, acceptRequest);
router.post("/rejectRequest", isLoggedIn, rejectRequest);
router.post("/unFriend", isLoggedIn, unFriend);

module.exports = router;