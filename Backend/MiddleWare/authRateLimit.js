
const rateLimit = require("express-rate-limit");

// Login and signup protection
const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests. Try again later.",
  },
});

// OTP verification: stricter limit
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Try again later.",
  },
});

// Resend OTP protection
const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Try again later.",
  },
});

// Password-reset protection
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password-reset requests. Try again later.",
  },
});

const codegenerateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many  requests. Try again later.",
  },
});

module.exports = {
  authLimiter,
  verifyOtpLimiter,
  resendOtpLimiter,
  passwordResetLimiter,
  codegenerateLimiter
};
