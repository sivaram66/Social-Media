const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query } = require("../utils/database");
const { sendEmail } = require("../utils/mailer");
const { getUserByEmail, updateUserPassword } = require("../models/user");

// Step 1: Send OTP to Email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

    // Save to verification_codes (Same table used for registration)
    await query(
      `INSERT INTO verification_codes (email, otp_code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET otp_code = $2, expires_at = $3`,
      [email, otp, expiresAt]
    );

    // Send Email
    await sendEmail(email, "Reset Password OTP", `<h1>${otp}</h1><p>Use this code to reset your password.</p>`);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Step 2: Reset Password (Verify OTP + Set New Password)
const resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    // Verify OTP
    const otpRecord = await query("SELECT * FROM verification_codes WHERE email = $1", [email]);
    if (otpRecord.rowCount === 0) return res.status(400).json({ error: "Invalid request" });
    
    const savedOtp = otpRecord.rows[0];
    if (savedOtp.otp_code !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > new Date(savedOtp.expires_at)) return res.status(400).json({ error: "OTP expired" });

    // Hash & Update Password
    const user = await getUserByEmail(email);
    const newHash = await bcrypt.hash(new_password, 10);
    await updateUserPassword(user.id, newHash);

    // Clean up OTP
    await query("DELETE FROM verification_codes WHERE email = $1", [email]);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { forgotPassword, resetPassword };