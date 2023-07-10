const Task = require('../../../models/Task');
const Table = require('../../../models/Table');

async function createTask(taskInfo, tableId) {
    try {
        const task = new Task(taskInfo);
        await task.save();
        const table = await Table.findById(tableId);
        if (!table) {throw new Error('Table không tồn tại')}
        table.tasks = table.tasks.concat({taskId: task._id});
        await table.save();
        return task;
    } catch (error) {
        throw new Error(error);
    }
}

async function getAllTasks() {
    try {
        const tasks = await Task.find();
        return tasks;
    } catch (error) {
        throw new Error(error);
    }
}

async function getTask(taskId) {
    try {
        const task = await Task.findById(taskId);
        return task;
    } catch (error) {
        throw new Error(error);
    }
}

async function editTask(taskId, updateInfo) {
    try {
        const filter = {_id: taskId};
        const update = {updateInfo};
        const task = await Task.findOneAndUpdate(filter, update);
        if (!task) throw new Error("Không tìm thấy task");
        return task;
    } catch (error) {
        throw new Error(error);
    }
}

async function deleteTask(taskId, tableId) {
    try {
        const filter = {_id: taskId};
        await Task.findOneAndDelete(filter, async function (err, task) {
            if (err){
                throw new Error(err);
            }
            else{
                let table = await Table.findById(tableId);
                table.tasks = table.tasks.filter((task)=> { return task.taskId !== req.params['taskId']});
                await table.save();
                return task
            }
        })
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {createTask, getAllTasks, getTask, editTask, deleteTask};