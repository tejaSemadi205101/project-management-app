import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, res, next) =>{
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = [];
    errors.array().map((err) =>extractedErrors.push({
        [err.path] : err.msg}
    ));

    console.log("❌ VALIDATION FAILED:", JSON.stringify(extractedErrors, null, 2));

    throw new ApiError(400, 'Validation error', extractedErrors);
}