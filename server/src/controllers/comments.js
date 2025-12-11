const logger = require("../utils/logger");
const { getPostById } = require("../models/post");
const { sendNotification } = require("../utils/notification-service"); // Import Service
const {
  getCommentById,
  createComment: createCommentModel,
  updateComment: updateCommentModel,
  deleteComment: deleteCommentModel,
  getPostComments: getPostCommentsModel,
  deleteCommentByOwner,
} = require("../models/comment");

// Create Comment
async function createComment(req, res) {
  try {
    const postId = Number(req.body?.post_id);
    const content = (req.body?.content || "").trim();

    if (!Number.isInteger(postId)) return res.status(400).json({ error: "post_id must be a number" });
    if (!content) return res.status(400).json({ error: "content is required" });

    const post = await getPostById(postId);
    if (!post || post.is_deleted) return res.status(404).json({ error: "Post not found" });
    if (post.comments_enabled === false) return res.status(403).json({ error: "Comments disabled" });

    const c = await createCommentModel({
      user_id: req.user.id,
      post_id: postId,
      content,
    });

    // TRIGGER NOTIFICATION
    await sendNotification({
        req,
        recipientId: post.user_id,
        type: "COMMENT",
        postId
    });

    return res.status(201).json(c);
  } catch (err) {
    logger.critical("Create comment error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Update Comment
async function updateComment(req, res) {
  try {
    const id = Number(req.params.comment_id);
    const content = (req.body?.content || "").trim();
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid ID" });
    if (!content) return res.status(400).json({ error: "content is required" });

    const updated = await updateCommentModel(id, req.user.id, content);
    if (!updated) return res.status(404).json({ error: "Comment not found" });
    return res.json(updated);
  } catch (err) {
    logger.critical("Update comment error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Delete Comment
async function deleteComment(req, res) {
  try {
    const id = Number(req.params.comment_id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid ID" });

    const comment = await getCommentById(id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const post = await getPostById(comment.post_id);
    if (!post || post.is_deleted) return res.status(404).json({ error: "Post not found" });

    const isCommentOwner = comment.user_id === req.user.id;
    const isPostOwner = post.user_id === req.user.id;

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (isCommentOwner) {
      await deleteCommentModel(id, req.user.id);
    } else {
      await deleteCommentByOwner(id);
    }

    return res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    logger.critical("Delete comment error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get Comments
async function getPostComments(req, res) {
  try {
    const postId = Number(req.params.post_id);
    if (!Number.isInteger(postId)) return res.status(400).json({ error: "Invalid ID" });

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "50", 10)));
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const offset = (page - 1) * limit;

    const data = await getPostCommentsModel(postId, limit, offset);
    return res.json({ page, limit, count: data.length, data });
  } catch (err) {
    logger.critical("List comments error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
};