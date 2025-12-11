const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getNotifications, markRead } = require("../controllers/notifications");

const router = express.Router();

router.get("/", authenticateToken, getNotifications);
router.put("/read", authenticateToken, markRead);

module.exports = router;