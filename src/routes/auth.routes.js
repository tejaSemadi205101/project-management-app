import { Router } from "express";
import { forgetPasswordRequest, getCurrentUser, logoutUser, registerUser, resendEmailVerification, resetForgetPasswordRequest, verifyEmail, changeCurrentPassword } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidation } from "../validators/index.js";
import { userLoginValidation } from "../validators/index.js";
import { login } from "../controllers/auth.controllers.js";
import { resendAccessToken } from "../controllers/auth.controllers.js";
import { userForgetPasswordValidation } from "../validators/index.js";
import { userResetPasswordValidation } from "../validators/index.js";
import { changeCurrentPasswordValidation } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/signup').post(userRegisterValidation(), validate, registerUser);
router.route('/login').post(userLoginValidation(), validate, login);
router.route('/refresh-token').post(resendAccessToken);
router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/resend-email-verification').post(verifyJWT, resendEmailVerification);
router.route('/current-user').post(verifyJWT, getCurrentUser);
router.route('/forgot-password').post(userForgetPasswordValidation(), validate, forgetPasswordRequest);
router.route('/reset-password/:resetPasswordToken').post(userResetPasswordValidation(), validate, resetForgetPasswordRequest);
router.route('/change-password').post(verifyJWT, changeCurrentPasswordValidation(), validate, changeCurrentPassword);
router.route('/logout').post(verifyJWT, logoutUser);

export default router; 