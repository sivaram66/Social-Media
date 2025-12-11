const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
} = require("../controllers/comments");
const router = express.Router();

/**
 * Comments routes
 * TODO: Implement comment routes when comment functionality is added
 */



// TODO: POST /api/comments - Create a comment on a post
router.post("/", authenticateToken, createComment);

// TODO: PUT /api/comments/:comment_id - Update a comment
router.put("/:comment_id(\\d+)", authenticateToken, updateComment);

// TODO: DELETE /api/comments/:comment_id - Delete a comment
router.delete("/:comment_id(\\d+)", authenticateToken, deleteComment);

// TODO: GET /api/comments/post/:post_id - Get comments for a post
router.get("/post/:post_id(\\d+)", authenticateToken, getPostComments);

module.exports = router;
