const { query } = require("../utils/database");



// TODO: Implement createComment function
async function createComment({ user_id, post_id, content }) {
  const r = await query(
    `INSERT INTO comments (user_id, post_id, content, created_at)
     VALUES ($1,$2,$3,NOW())
     RETURNING id, user_id, post_id, content, created_at`,
    [user_id, post_id, content]
  );
  return r.rows[0];
}

// TODO: Implement updateComment function
async function updateComment(commentId, userId, content) {
  const r = await query(
    `UPDATE comments
        SET content=$1, updated_at=NOW()
      WHERE id=$2 AND user_id=$3
      RETURNING id, user_id, post_id, content, created_at, updated_at`,
    [content, commentId, userId]
  );
  return r.rows[0] || null;
}


// TODO: Implement deleteComment function
async function deleteComment(commentId, userId) {
  const r = await query(`DELETE FROM comments WHERE id=$1 AND user_id=$2`, [
    commentId,
    userId,
  ]);
  return r.rowCount > 0;
}

// TODO: Implement getPostComments function
async function getPostComments(postId, limit = 50, offset = 0) {
  const r = await query(
    `SELECT c.id, c.user_id, c.post_id, c.content, c.created_at, c.updated_at,
            u.username, u.full_name
       FROM comments c
       JOIN users u ON u.id = c.user_id
      WHERE c.post_id=$1
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );
  return r.rows;
}
// TODO: Implement getCommentById function
async function deleteCommentByOwner(commentId) {
  const r = await query(`DELETE FROM comments WHERE id=$1`, [commentId]);
  return r.rowCount > 0;
}
// Fetching a single comment
async function getCommentById(commentId) {
  const r = await query(`SELECT * FROM comments WHERE id = $1`, [commentId]);
  return r.rows[0] || null;
}

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  deleteCommentByOwner,
  getPostComments,
  getCommentById,
  // Functions will be implemented here
};
