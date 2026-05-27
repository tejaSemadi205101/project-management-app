import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

const taskPermissionRole = (roles = []) => {
    return asyncHandler( async (req, res, next) =>{
        const { taskId } = req.params

        if (!taskId) {
            throw new ApiError(400, 'Task is missing')
        }

        const task = await Task.findOne({
            task : new mongoose.Types.ObjectId(taskId),
            user : new mongoose.Types.ObjectId(req.user._id)
        })

        if (!task) {
            throw new ApiError(404, 'Task is not found')
        }

        const givenRole = task?.role

        req.user.role = givenRole

        if(!roles.includes(givenRole)){
            throw new ApiError(403, 'You are not authorized to perform this action')
        }
    }) 
}