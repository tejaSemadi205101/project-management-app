import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidation } from "../validators/index.js";
import { userLoginValidation } from "../validators/index.js";
import { login } from "../controllers/auth.controllers.js";

const router = Router();

router.route('/signup').post(userRegisterValidation(), validate, registerUser);
router.route('/login').post(userLoginValidation(), validate, login);

export default router; 