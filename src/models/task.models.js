import mongoose from 'mongoose';
import { AvaibleTaskStatus } from '../utils/constans.js';

const taskSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },

    description : String,

    status : {
        type : mongoose.Schema.Types.ObjectId,
        enum : AvaibleTaskStatus,
        default : AvaibleTaskStatus.TODO
    },

    assignedTo : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },

    assignedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },

    attachments : {
        type : [{
            url : String,
            mimetype : String,
            size : Number,
        }],
        default : []
    }

}, {timestamps : true})

export const Task = mongoose.model('Task', taskSchema)