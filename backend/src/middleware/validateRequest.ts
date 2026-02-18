import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult, ValidationChain } from 'express-validator';

// Middleware to check validation results
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      })),
    });
    return;
  }
  
  next();
};

// URL validation rules
export const validateCreateReview: ValidationChain[] = [
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    })
    .withMessage('Must be a valid URL starting with http:// or https://')
    .isLength({ max: 2048 })
    .withMessage('URL must not exceed 2048 characters')
    .customSanitizer((value: string) => {
      // Remove any potential XSS in URL
      return value.replace(/[<>"']/g, '');
    })
    .custom((value: string) => {
      // Block private/local IPs to prevent SSRF attacks
      const blockedPatterns = [
        /^https?:\/\/localhost/i,
        /^https?:\/\/127\./,
        /^https?:\/\/0\.0\.0\.0/,
        /^https?:\/\/10\./,
        /^https?:\/\/192\.168\./,
        /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./,
      ];

      if (blockedPatterns.some(pattern => pattern.test(value))) {
        throw new Error('Private or local URLs are not allowed');
      }

      return true;
    }),
];

// ID param validation rules
export const validateReviewId: ValidationChain[] = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Review ID is required')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),
];
