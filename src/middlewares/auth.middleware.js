import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmembers.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async(req, res, next) =>{
    const token = req.cookies?.accessToken || req.header?.authorization?.replace("Bearer ", "")

    if(!token){
        throw new ApiError(401, "Unautorization request")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry')

        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }

})
