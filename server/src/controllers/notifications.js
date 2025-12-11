const { query } = require("../utils/database");

// Get my notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch last 50 notifications with sender details
    const result = await query(
      `SELECT n.*, u.username, u.full_name, u.profile_pic_url
       FROM notifications n
       JOIN users u ON n.sender_id = u.id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark all as read
const markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1`,
      [userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getNotifications, markRead };