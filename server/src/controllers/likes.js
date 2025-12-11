const logger = require("../utils/logger");
const { sendNotification } = require("../utils/notification-service"); // Import Service
const {
  likePost: likeModel,
  unlikePost: unlikeModel,
  getPostLikes: getPostLikesModel,
  getUserLikes: getUserLikesModel,
} = require("../models/like");
const { getPostById } = require("../models/post");

// Like Post
async function likePost(req, res) {
  try {
    const postId = Number(req.body?.post_id);
    if (!Number.isInteger(postId)) return res.status(400).json({ error: "Invalid ID" });

    const post = await getPostById(postId);
    if (!post || post.is_deleted) return res.status(404).json({ error: "Post not found" });

    // 1. Perform Like
    await likeModel(req.user.id, postId);
    
    // 2. Trigger Notification (DB + Socket + Email)
    await sendNotification({
        req,
        recipientId: post.user_id,
        type: "LIKE",
        postId
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    logger.critical("Like error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Unlike Post
async function unlikePost(req, res) {
  try {
    const postId = Number(req.params.post_id);
    if (!Number.isInteger(postId)) return res.status(400).json({ error: "Invalid ID" });
    
    const ok = await unlikeModel(req.user.id, postId);
    return res.json({ ok });
  } catch (err) {
    logger.critical("Unlike error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get Post Likes
async function getPostLikes(req, res) {
  try {
    const postId = Number(req.params.post_id);
    if (!Number.isInteger(postId)) return res.status(400).json({ error: "Invalid ID" });
    
    const post = await getPostById(postId);
    if (!post || post.is_deleted) return res.status(404).json({ error: "Post not found" });
    
    const users = await getPostLikesModel(postId);
    return res.json({ count: users.length, users });
  } catch (err) {
    logger.critical("Get post likes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get User Likes
async function getUserLikes(req, res) {
  try {
    const posts = await getUserLikesModel(req.user.id);
    return res.json({ count: posts.length, posts });
  } catch (err) {
    logger.critical("Get user likes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
};