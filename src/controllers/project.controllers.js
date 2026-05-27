import mongoose from 'mongoose';
import { User } from '../models/user.models.js';
import { Project } from '../models/project.models.js';
import { ProjectMember } from '../models/projectmembers.models.js';
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvaibleUserRoles, UserRolesEnum } from '../utils/constans.js';

const createProject = asyncHandler ( async (req, res) => {
    const { projectName, projectDescription} =  req.body

    const project = await Project.create({
        projectName,
        projectDescription,
        createdBy : new mongoose.Types.ObjectId(req.user._id)
    })

    await ProjectMember.crate ({
        user : new mongoose.Types.ObjectId(req.user._id),
        project : new mongoose.Types.ObjectId(project._id),
        role : UserRolesEnum.ADMIN
    })

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"))
})

const updateProject = asyncHandler ( async (req, res) => {
    const {projectName, projectDescription} = req.body
    const {projectId} = req.params

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            projectName,
            projectDescription,
        },
        {new : true}
    )

    if(!project){
        throw new ApiError(404, "Project not found!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, Project, "Project updated successfully"))

})

const deleteProject = asyncHandler (async (req, res) =>{
    const { projectId } = req.params

    const project = await Project.findByIdAndDelete(projectId)

    if(!project){
        throw new ApiError(404, "Project not found!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, Project, "Project deleted successfully"))
})

const getProject = asyncHandler ( async (req, res) => {
    const projects = await Project.aggregate([
        {
            //mencari dan mencocokan user yang sudah login
            $match : {
                user : new mongoose.Types.ObjectId(req.user._id)
            }
        },

        {
            //mencari project beserta jumlah dan siapa saja member yang masuk ke project itu
            $lookup : {
                from : 'projects',
                localField : 'projects',
                foreignField : '_id',
                as : 'projects',
                pipeline : [
                    {
                        $lookup : {
                            from : 'projectmembers',
                            localField : '_id',
                            foreignField : 'projects',
                            as : 'projectmembers'
                        }
                    },
                    {
                        $addFields : {
                            members : {
                                $size : $project
                            }
                        }
                    }
                ]
            } 
        },

        {
            $unwind : '$projects'
        },

        {
            $project : {
                project : 1,
                    _id : 1,
                    projectName : 1,
                    projectDescription : 1,
                    createdBy : 1,
                    createdAt : 1,
            },
            role : 1,
            _id : 0
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, projects, "Project fetched successfully"))
})

const getProjectById = asyncHandler ( async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404, 'Project not found!')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, 'Project fetched successfully'))
}) 

const addMemberProject = asyncHandler (async (req, res) =>{
    const { email, role } = req.body
    const { projectId } = req.params
    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, 'User not found')
    }   

    await ProjectMember.findByIdAndUpdate(
        {
            user : new mongoose.Types.ObjectId(user._id),
            project : new mongoose.Types.ObjectId(projectId)
        },
        {
            user : new mongoose.Types.ObjectId(user._id),
            project : new mongoose.Types.ObjectId(projectId),
            role : role,
        },
        {
            upsert : true,
            new : true
        }
    ) 

    return res
        .status(200)
        .json(new ApiResponse(200, {} , "Member added successfully"))
})

const updateMemberRole = asyncHandler (async (req, res) =>{
    const { projectId, userId } = req.params
    const { newRole } = req.body //mengambil data role baru jika ada update oleh user

    if(!AvaibleUserRoles.includes(newRole)){
        throw new ApiError(400, "Invalid role")
    }

    let projectMember = await ProjectMember.findOne({
        user : new mongoose.Types.ObjectId(userId),
        project : new mongoose.Types.ObjectId(projectId)
    })

    if(!projectMember){
        throw new ApiError(404, "Project member not found")
    }

    const project = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role : newRole
        },
        {
            new : true
        }
    )

    if(!projectMember){
        throw new ApiError(400, "Something went wrong")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, projectMember, "Member role updated successfully"))
})

const deleteMemberProject = asyncHandler (async (req, res) => {
    const { projectId, userId } = req.params

    let projectMember = await ProjectMember.findOne({
        user : new mongoose.Types.ObjectId(userId),
        project : new mongoose.Types.ObjectId(projectId)
    })

    if(!projectMember){
        throw new ApiError(404, "Project member not found")
    }

    projectMember = await ProjectMember.findByIdAndDelete(projectMember._id)

    if(!projectMember){
        throw new ApiError(404, "Project member not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, ProjectMember, "Member deleted successfully"))
})

const getProjectMember = asyncHandler (async (req, res) =>{
    const { projectId } = req.params
    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404, 'Project not found')
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            //mencari semua baris dalam project member yang project id nya sesuai  
            $match : {
                project : new mongoose.Types.ObjectId(projectId)
            }
        },

        {
            //mencari dan menampilkan data user dari koleksi user
            $lookup : {
                from : 'users',
                localField : 'user',
                foreignField : '_id',
                as : 'user',
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
        },

        {
            $addFields : {
                user : {
                    $arayElemAt : ['$user', 0]
                }
            }
        },

        {
            $project : {
                project : 1,
                user : 1,
                role : 1,
                createdAt : 1,
                updatedAt : 1,
                _id: 0
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, projectMembers, 'Project members fetched successfully'))
})

export {
    getProject,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectMember,
    addMemberProject,
    updateMemberRole,
    deleteMemberProject
}
