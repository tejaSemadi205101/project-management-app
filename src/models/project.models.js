import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema({
    projectName : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    projectDescription : {
        type : String,
        trim : true,
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }
}, {timestamps : true})

export const Project = mongoose.model('Project', projectSchema)