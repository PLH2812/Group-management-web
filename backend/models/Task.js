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
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;