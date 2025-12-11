const crypto = require("crypto");
const {
  createUser,
  getUserByUsername,
  verifyPassword,
} = require("../models/user");
const { generateToken } = require("../utils/jwt");
const logger = require("../utils/logger");
const { query } = require("../utils/database"); 
const { sendEmail } = require("../utils/mailer");

/**
 * Step 1: Generate OTP and send to email
 * Body: { username, email }
 */
const sendOtp = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required" });
    }

    // 1. Check if username or email already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken" });
    }
    
    // Check email uniqueness (Manual query since model doesn't have getByEmail yet)
    const emailCheck = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // 2. Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // Expires in 10 minutes

    // 3. Store OTP in DB (Upsert: Update if exists, Insert if new)
    await query(
      `INSERT INTO verification_codes (email, otp_code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) 
       DO UPDATE SET otp_code = $2, expires_at = $3`,
      [email, otp, expiresAt]
    );

    // 4. Send Email
    const emailSent = await sendEmail(
      email,
      "Your Verification Code - Social Media",
      `<h3>Welcome to Social Media!</h3>
       <p>Your verification code is:</p>
       <h1>${otp}</h1>
       <p>This code expires in 10 minutes.</p>`
    );

    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send email" });
    }

    logger.verbose(`OTP sent to ${email}`);
    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    logger.critical("Send OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Step 2: Verify OTP and Register new user
 * Body: { username, email, password, full_name, otp }
 */
const register = async (req, res) => {
  try {
    const { username, email, password, full_name, otp } = req.body;
    const cleanUsername = username.toLowerCase();

    // 1. Verify OTP
    const otpRecord = await query(
      "SELECT * FROM verification_codes WHERE email = $1",
      [email]
    );

    if (otpRecord.rowCount === 0) {
      return res.status(400).json({ error: "No OTP found. Please request a new one." });
    }

    const savedOtp = otpRecord.rows[0];

    // Check matching
    if (savedOtp.otp_code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check expiry
    if (new Date() > new Date(savedOtp.expires_at)) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // 2. Create user (Password hashing happens inside createUser model)
    const user = await createUser({ cleanUsername, email, password, full_name });

    // 3. Delete used OTP
    await query("DELETE FROM verification_codes WHERE email = $1", [email]);

    // 4. Generate token
    const token = generateToken({
      userId: user.id,
      cleanUsername: user.cleanUsername,
    });

    logger.verbose(`New user registered: ${cleanUsername}`);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        cleanUsername: user.cleanUsername,
        email: user.email,
        full_name: user.full_name,
      },
      token,
    });
  } catch (error) {
    logger.critical("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Login user (Unchanged)
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username.toLowerCase();

    const user = await getUserByUsername(cleanUsername);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      userId: user.id,
      cleanUsername: user.cleanUsername,
    });

    logger.verbose(`User logged in: ${cleanUsername}`);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        cleanUsername: user.cleanUsername,
        email: user.email,
        full_name: user.full_name,
      },
      token,
    });
  } catch (error) {
    logger.critical("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user profile (Unchanged)
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user.id,
        cleanUsername: user.cleanUsername,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    logger.critical("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendOtp,
  register,
  login,
  getProfile,
};