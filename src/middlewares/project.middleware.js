import { ProjectMember } from "../models/projectmembers.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const validateProjectPermission = (roles = []) => {
    return asyncHandler(async (req, res, next) =>{

        const { projectId } = req.params

        if(!projectId){
            throw new ApiError(400, "Project is missing")
        }

        const project = await ProjectMember.findOne({
            user : new mongoose.Types.ObjectId(req.user._id),
            project : new mongoose.Types.ObjectId(projectId)
        })

        if(!project){
            throw new ApiError(400, "Project is not found")
        }

        const givenRole = project?.role

        req.user.role = givenRole

        if (!role.includes(givenRole)) {
            throw new ApiError(403, 'You are not authorized to perform this action')
        }

        next()
    })
}