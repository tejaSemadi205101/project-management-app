import { Notes } from "../models/notes.models.js";
import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

export const validateNotesPermission = (roles = []) =>{
  return asyncHandler(async(req, res, next) =>{
    const {projectId, notesId} = req.params

    const project = await Project.findOne({
      Notes : new mongoose.Types.ObjectId(notesId),
      project : new mongoose.Types.ObjectId(projectId)
    })

    if (!project) {
      throw new ApiError(404, "Project not found")
    }

    req.note = note

    next()
  })
}