import { SubTask } from "../models/subtask.models";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

export const validateSubtaskPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) =>{
      const { subTask } = req.params

      if (!subTask) {
        throw new ApiError(400, 'Subtask is missing')
      }

      const subtask = await Subtask.findOne({
        subTask : new mongoose.Types.ObjectId(subTaskId),
        user : new mongoose.Types.ObjectId(req.user._id)
      })

      if (!subtask) {
        throw new ApiError(404, 'Subtask is not found')
      }

      const givenRole = subtask?.role

      req.user.role = givenRole

      if(!roles.includes(givenRole)){
          throw new ApiError(403, 'You are not authorized to perform this action')
      }

      next()
  }) 
}
