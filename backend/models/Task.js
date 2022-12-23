const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
        name:{
            type: String,
            required: true
        },
        description: {
            type: String
        },
        assignedTo:{
            userId: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        },
        status:{
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
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