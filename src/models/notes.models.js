import mongoose from 'mongoose';

const projectNotesSchema = new Schema({
    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
        required : true
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    note : {
        type : String,
        required : true
    }
})

export const ProjectNotes = mongoose.model('ProjectNotes', projectNotesSchema)