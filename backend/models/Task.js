const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
        name:{
            type: String,
            required: true
        },
        description: {
            type: String
        },
        assignedTo:[
            {
            userId: {
                type: String
            },
            name: {
                type: String
            }
        }],
        status:{
            type: String,
            required: true
        },
        submission:{
            type:String
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        tableId:{
            type:String,
            required: true
        },
        syncedToCalendar: {
            type:Boolean,
            default: false
        }
    });

taskSchema.statics.getMyTasks = async function(userId){
    let myTasks = await Task.find({"assignedTo.userId": userId })
    if (!myTasks)
        return {message: "Bạn không có task nào!"}
    return myTasks;
}

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;