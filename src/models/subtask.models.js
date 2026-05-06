import mongoose from 'mongoose';

const subTaskSchema = new Schema({
    title :{
        type : String,
        required : true,
        trim : true,
    },

    description : String,

    isCompleted : {
        type : Boolean,
        default : false,
    },

    createdBy : {
        type : mongoose.Types.ObjectId,
        ref : 'User'
    }

}, {timestamps : true})

export const SubTask = mongoose.model('SubTask', subTaskSchema)