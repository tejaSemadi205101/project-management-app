import mongoose from 'mongoose';
import { User } from '../models/user.models.js';
import { Project } from '../models/project.models.js';
import { Task } from '../models/task.models.js';
import { SubTask } from '../models/subtask.models.js';
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvaibleUserRoles, UserRolesEnum } from '../utils/constans.js';
import { urlencoded } from 'express';
import { pipeline } from 'nodemailer/lib/xoauth2/index.js';

const createTask = asyncHandler( async(req, res) => {
    const {title, description, status, assignedTo} = req.body
    const {projectId} = req.params
    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(404, 'Project not found')
    }

    const files = req.files || []

    const attachments = files.map((file) => {
        return {
            url = `${process.env.SERVER_URL}`/images/`${file.originalName}`,
            mimetype = file.mimetype,
            size = file.size
        }
    })

    const task = await Task.create({
        title,
        description,
        status,
        project : new mongoose.Types.ObjectId(projectId),
        assignedTo : assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        assignedBy : new mongoose.Types.ObjectId(req.user._id),
        attachments
    })

    return res
        .status(201)
        .json(new ApiResponse(201, task, 'Task created successfully'))
})

const getTask = asyncHandler( async(req, res) => {
    const {projectId} = req.params
    const project = await Project.findById(projectId)

    if (!projectId) {
        throw new ApiError(404, 'Project not found')
    }
    const task = await Task.find({
        project : new mongoose.Types.ObjectId(projectId)
    }).populate('assignedTo', 'username fullName avatar')
    //populated mirip dengan fungsi join untuk mengambil referensi data dari suatu koleksi

    return res
        .status(200)
        .json(new ApiResponse(200, task, 'Task fetched successfully'))
})

const getTaskById = asyncHandler( async(req, res) => {
    const {taskId} = req.params

    const task = await Task.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup : {
                from : 'users',
                localField : 'assignedTo',
                foreignField : '_id',
                as : 'assignedTo',
                pipeline : [
                    {
                        _id : 1,
                        username : 1,
                        fullName : 1,
                        avatar : 1
                    }
                ]
            }
        },
        {
            $lookup : {
                from : 'subtasks',
                localField : '_id',
                foreignField : 'task',
                as : 'subtasks',
                pipeline : [
                    {
                        $lookup : {
                            $lookup : {
                                from : 'users',
                                localField : 'createdBy',
                                foreignField : '_id',
                                as : 'createdBy',
                                pipeline : [
                                    {
                                        $project : {
                                            _id : 1,
                                            username : 1,
                                            fullName : 1,
                                            avatar : 1
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                createdBy : {
                    $arrayElemAt : ['createdBy', 0]
                }
            }
        },
    ])
    if(!task || task.length === 0){
        throw new ApiError(404, 'Task not found')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task[0], 'Task fetched successfully'))
})

const updateTask = asyncHandler( async(req, res) => {
    const {taskId, userId} = req.params
    const {newTitle, newDescription, newStatus, newAssignedTo, newAttachments}

    if (!AvaibleUserRoles) {
        throw new ApiError(400, 'Invalid role')
    }

    if (!taskId) {
        throw new ApiError(404, 'Task not found')
    }

    let updatedTask = await Task.findOne({
        task : new mongoose.Types.ObjectId(taskId),
        user : new mongoose.Types.ObjectId(userId)
    })

    const tasks = await Task.findByIdAndUpdate(
        updateTask._id,{
            title : newTitle,
            description : newDescription,
            status : newStatus,
            assignedTo : newAssignedTo ? new mongoose.Types.ObjectId(newAssignedTo) : undefined,
            attachments : newAttachments
        }, 
        {
            new : true
        }
    )

    if (!updateTask) {
        throw new ApiError(400, 'Something went wrong')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, 'Task updated successfully'))
})

const deleteTask = asyncHandler( async(req, res) => {
    const {taskId, userId} = req.params

    deletedTask = await Task.findOne({
        task : new mongoose.new.ObjectId(taskId),
        user : new mongoose.Types.ObjectId(userId)
    })

    if (!deletedTask) {
        throw new ApiError(404, 'Task not found')
    }

    deleteTask = await Task.findByIdAndDelete(deletedTask._id)

    if(!deleteTask){
        throw new ApiError(400, 'Something went wrong')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deleteTask, 'Task deleted successfully'))
})

const createSubtask = asyncHandler( async(req, res) => {
    const {taskId} = req.params
    const {title, description, isCompleted} = req.body

    const task = await Task.findById(taskId)

    if (!task) {
        throw new ApiError(404, 'Task not found')
    }

    const subtask = await SubTask.create({
        title,
        description,
        isCompleted,
        createdBy : new mongoose.Types.ObjectId(req.user._id)
    })
    
    return res
        .status(201)
        .json(new ApiResponse(201, subtask, 'Subtask created successfully'))
    
})

const updateSubtask = asyncHandler( async(req, res) => {
    const {subTaskId} = req.params
    const {newTitle, newDescription, newIsCompleted} = req.body

    if (!subTaskId) {
        throw new ApiError(404, 'Subtask not found')
    }

    let updateSubTask = await SubTask.findOne({
        subTaskId : new mongoose.Types.ObjectId(subTaskId),
        user : new mongoose.Types.ObjectId(userId)
    })

    if (!updateSubTask) {
        throw new ApiError(404, 'Subtask not found')
    }

    const subtask = await SubTask.findByIdAndUpdate(
        subTaskId._id,
        {
            title : newTitle,
            description : newDescription,
            isCompleted : newIsCompleted
        },
        {
            new : true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, 'Subtask updated successfully'))
})

const deleteSubtask = asyncHandler( async(req, res) => {
    const {subTaskId} = req.params

    let deletedTask = await SubTask.findOne({
        subTaskId = new mongoose.Types.ObjectId(subTaskId),
        user = new mongoose.Types.ObjectId(userId)
    })

    if (deleteTask) {
        throw new ApiError(404, 'Subtask not found')
    }

    const subtask = await SubTask.findByIdAndDelete(deletedTask._id)

    if (!subtask) {
        throw new ApiError(400, 'Something went wrong')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, 'Subtask deleted successfully'))
})

export {
    createTask,
    getTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask
}