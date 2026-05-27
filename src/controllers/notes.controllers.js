import mongoose, { mongo } from 'mongoose';
import { User } from '../models/user.models.js';
import { Project } from '../models/project.models.js';
import { Notes } from '../models/notes.models.js';
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvaibleUserRoles, UserRolesEnum } from '../utils/constans.js';
import { urlencoded } from 'express';
import { pipeline } from 'nodemailer/lib/xoauth2/index.js';

const createProjectNotes = asyncHandler(async(req, res) => {
    const {projectId} = req.params
    const {notes, createdBy} = req.body
    const project = await Project.findById(projectId)

    if (!project) {
      throw new Error(404, "Project not found");
    }

    const notes = await Notes.create({
      notes,
      createdBy : new mongoose.Types.ObjectId(req.user._id)
    })

    return res
      .status(201)
      .json(new ApiResponse(201, notes, "Notes created successfully"))
})

const updatePeojectNotes = asyncHandler(async(req, res) =>{
  const { projectId, notesId } = req.params
  const { newNotes } = req.body

  if(!notesId){
    throw new ApiError(404, "Notes not found")
  }

  let updateNotes = await Notes.findOne({
    notes : new mongoose.Types.ObjectId(projectId),
    notes : new mongoose.Types.ObjectId(notesId)
  })

  const notes = await Notes.findByIdAndUpdate(
    Notes._id,{
      notes : newNotes
    },
    {
      new : true
    })

    return res
      .status(200)
      .json(new ApiResponse(200, notes, "Notes updated successfully"))
})

const deleteProjectNotes = asyncHandler(async(req, res) => {
  const {projectId, notesId}

  deletedNotes = await Notes.findOne({
    notes : new mongoose.Types.ObjectId(notesId),
    user : new mongoose.Types.ObjectId(userId)
  })

  if (!deletedNotes) {
    throw new ApiError(404, "Notes not found")
  }

  deletedNotes = await Notes.findByIdAndDelete(deletedNotes._id)

  if (!deletedNotes) {
    throw new ApiError(400, "Something went wrong")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedNotes, "Notes deleted successfully"))
})

const getProjectNotes = asyncHandler(async(req, res) => {
    const {projectId} = req.params
    const project = await Project.findById(projectId)

    if (!project) {
        throw new Error(404, "Project not found");
    }

    const notes = await Notes.find({
      project : new mongoose.Types.ObjectId(projectId)
    }).populate('createdBy', 'username fullName').sort({createdAt : -1})

    return res
      .status(200)
      .json(new ApiResponse(200, notes, "Notes fetched successfully"))
})

const getProjectNotesById = asyncHandler(async(req, res) => {
  const {projectId, notesId} = req.params

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(notesId)) {
    throw new Error(404, "Project not found");
  }

  const note = await Notes.findOne({
    notes : new mongoose.Types.ObjectId(notesId),
    project : new mongoose.Types.ObjectId(projectId)
  }).populate('createdBy', 'username fullName')

  if(!note){
    throw new Error(404, "Notes not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Notes fetched successfully"))
})

export {
  createProjectNotes,
  updatePeojectNotes,
  deleteProjectNotes,
  getProjectNotes,
  getProjectNotesById}