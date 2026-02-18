import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 9999: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again after 15 minutes',
  },
});

// Strict limiter for review creation (expensive operation)
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Review limit reached. Maximum 10 reviews per hour allowed',
  },
});
