const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
    assignedTo: [
        {
          userId: {
            type: String,
            required: true
          },
          name: {
            type: String,
            required: true
          }
        }
    ],
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
    },
    groupId: {
      type: string,
      required: true
    }
});

taskSchema.statics.getMyTasks = async function(userId){
  let myTasks = await Group.find({"assignedTo.userId": userId })
  if(!myTasks)
      return {message: "Bạn không có task!"};
  return myTasks;
}

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;