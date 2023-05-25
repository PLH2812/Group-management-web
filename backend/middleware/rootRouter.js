const express = require('express');
let rootRouter = express.Router();

const account = require("../routers/user/account");
const group = require("../routers/user/group");
const table = require("../routers/user/table");
const task = require("../routers/user/task");
const chat = require("../routers/user/chat")
const admin = require("../routers/admin/admin");

rootRouter.use(account);
rootRouter.use(group);
rootRouter.use(table);
rootRouter.use(task);
rootRouter.use(admin);
rootRouter.use(chat);

module.exports = rootRouter;