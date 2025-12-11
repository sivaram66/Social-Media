const { query } = require("../utils/database");




const { query } = require("../utils/database");

// TODO: Implement followUser function
async function followUser(followerId, followeeId) {
  await query(
    `INSERT INTO follows (follower_id, followee_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [followerId, followeeId]
  );
  return true;
}

// TODO: Implement unfollowUser function
async function unfollowUser(followerId, followeeId) {
  const r = await query(
    `DELETE FROM follows
      WHERE follower_id = $1 AND followee_id = $2`,
    [followerId, followeeId]
  );
  return r.rowCount > 0;
}
// TODO: Implement getFollowing function
async function getFollowing(userId) {
  const r = await query(
    `SELECT u.id, u.username, u.full_name
       FROM follows f
       JOIN users u ON u.id = f.followee_id
      WHERE f.follower_id = $1
      ORDER BY u.username`,
    [userId]
  );
  return r.rows;
}

// TODO: Implement getFollowCounts function
async function getFollowers(userId) {
  const r = await query(
    `SELECT u.id, u.username, u.full_name
       FROM follows f
       JOIN users u ON u.id = f.follower_id
      WHERE f.followee_id = $1
      ORDER BY u.username`,
    [userId]
  );
  return r.rows;
}

//stats
async function getFollowCounts(userId) {
  const r = await query(
    `SELECT
        (SELECT COUNT(*)::int FROM follows WHERE followee_id = $1) AS followers,
        (SELECT COUNT(*)::int FROM follows WHERE follower_id = $1) AS following`,
    [userId]
  );
  return r.rows[0];
}


module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
};
