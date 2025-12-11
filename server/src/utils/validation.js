const Joi = require("joi");

/**
 * Validation schemas for API endpoints
 */

// Schema for Step 1: Sending the OTP
const sendOtpSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
});

// Schema for Step 2: Verifying OTP and Creating Account
// Update verifyRegistrationSchema inside src/utils/validation.js

const verifyRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  // NEW: Stronger password rules
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[0-9])")) // Requires 1 letter + 1 number
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base": "Password must contain at least 1 letter and 1 number"
    }),
  full_name: Joi.string().min(1).max(100).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    "string.pattern.base": "OTP must be 6 digits"
  }),
});


const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const createPostSchema = Joi.object({
	content: Joi.string().allow(null, '').optional(), 
	media_url: Joi.string().uri().optional().allow(null, ''),
	comments_enabled: Joi.boolean().default(true),
});

/**
 * Middleware to validate request body against schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  sendOtpSchema,
  verifyRegistrationSchema,
  userLoginSchema,
  createPostSchema,
  validateRequest,
};