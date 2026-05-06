import mongoose from 'mongoose';
import { AvaibleTaskStatus, AvaibleTaskStatus } from '../utils/constans';

const taskSchema = new Schema({
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
        type : mongoose.Schema.TypesObjectId,
        ref : 'User'
    },

    assignedBy : {
        type : mongoose.Schema.TypesObjectId,
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