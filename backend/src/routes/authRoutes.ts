import { Router } from 'express';
import {
  signup,
  signin,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  signupSchema,
  signinSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from '../validators';

const router = Router();

router.post('/signup', validate(signupSchema), asyncHandler(signup));
router.post('/signin', validate(signinSchema), asyncHandler(signin));
router.post(
  '/request-password-reset',
  validate(passwordResetRequestSchema),
  asyncHandler(requestPasswordReset)
);
router.post('/reset-password', validate(passwordResetSchema), asyncHandler(resetPassword));

export default router;
