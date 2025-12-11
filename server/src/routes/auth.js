const express = require("express");
const {
  validateRequest,
  sendOtpSchema,
  verifyRegistrationSchema,
  userLoginSchema,
} = require("../utils/validation");
const { sendOtp, register, login, getProfile } = require("../controllers/auth");
const { authenticateToken } = require("../middleware/auth");
const { forgotPassword, resetPassword } = require("../controllers/password_reset");

const router = express.Router();

/**
 * Authentication routes
 */

// Step 1: POST /api/auth/send-otp (Send code to email)
router.post("/send-otp", validateRequest(sendOtpSchema), sendOtp);

// Step 2: POST /api/auth/register (Verify code + Create account)
router.post("/register", validateRequest(verifyRegistrationSchema), register);

// POST /api/auth/login - Login user
router.post("/login", validateRequest(userLoginSchema), login);

// GET /api/auth/profile - Get current user profile (protected)
router.get("/profile", authenticateToken, getProfile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
module.exports = router;