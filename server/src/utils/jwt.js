const jwt = require("jsonwebtoken");
const logger = require("./logger");

/**
 * Generate JWT token for user authentication
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
};

const rawToken = (tokenOrHeader) => {
  if(!tokenOrHeader) return null;
  const parts = tokenOrHeader.split(" ");
  if(parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  return tokenOrHeader;
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (tokenOrHeader) => {
  const raw = rawToken(tokenOrHeader);
  if(!raw) throw new error("Invalid token");
  try {
    return jwt.verify(raw, process.env.JWT_SECRET);
  } catch (error) {
    logger.critical("Token verification failed:", error.message);
    throw new Error("Invalid token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
