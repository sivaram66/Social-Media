const { query } = require("../utils/database");
const logger = require("../utils/logger");



// Updated likePost with strict syntax and logging
async function likePost(userId, postId) {
  try {
    console.log(`[MODEL] Attempting to like - User: ${userId}, Post: ${postId}`);
    
    await query(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING`, // Added specific conflict target
      [userId, postId]
    );
    
    console.log(`[MODEL] Like saved successfully`);
    return true;
  } catch (err) {
    console.error("[MODEL] Error saving like:", err);
    throw err;
  }
}

// Updated unlikePost
async function unlikePost(userId, postId) {
  try {
    console.log(`[MODEL] Attempting to unlike - User: ${userId}, Post: ${postId}`);
    
    const r = await query(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );
    
    console.log(`[MODEL] Unlike result - Rows affected: ${r.rowCount}`);
    return r.rowCount > 0;
  } catch (err) {
    console.error("[MODEL] Error removing like:", err);
    throw err;
  }
}

// Implement getPostLikes function
async function getPostLikes(postId) {
  const r = await query(
    `SELECT u.id, u.username, u.full_name
       FROM likes l
       JOIN users u ON u.id = l.user_id
       JOIN posts p on p.id = l.post_id
      WHERE l.post_id = $1
        AND p.is_deleted = FALSE
      ORDER BY u.username`,
    [postId]
  );
  return r.rows;
}

// Implement getUserLikes function
async function getUserLikes(userId) {
  const r = await query(
    `SELECT 
        p.id,
        p.content,
        p.media_url,
        p.comments_enabled,
        p.created_at,
        u.id AS author_id,
        u.username
      FROM likes l
      JOIN posts p ON p.id = l.post_id
      JOIN users u ON u.id = p.user_id
     WHERE l.user_id = $1
       AND p.is_deleted = FALSE
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return r.rows;
}

// Implement hasUserLikedPost function
async function hasUserLikedPost(userId, postId) {
  const r = await query(
    `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2 LIMIT 1`,
    [userId, postId]
  );
  return r.rowCount > 0;
}

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
};