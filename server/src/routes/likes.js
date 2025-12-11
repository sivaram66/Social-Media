const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  likePost, 
  unlikePost, 
  getPostLikes, 
  getUserLikes, 
} = require("../controllers/likes");
const router = express.Router();

/**
 * Likes routes
 * TODO: Implement like routes when like functionality is added
 */



// TODO: POST /api/likes - Like a post
router.post("/", authenticateToken, likePost);

// DELETE /api/likes/:post_id - Unlike a post
router.delete("/:post_id(\\d+)", authenticateToken, unlikePost);

// GET /api/likes/post/:post_id - Get likes for a post
router.get("/post/:post_id(\\d+)", authenticateToken, getPostLikes);

// GET /api/likes/user/me - Get posts liked by the current user
router.get("/user/me", authenticateToken, getUserLikes);





module.exports = router;
