import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidation } from "../validators/index.js";

const router = Router();

router.route('/signup').post(userRegisterValidation(), validate, registerUser);

export default router; 