const express = require("express");
const cookieParser = require("cookie-parser");
const userRouter = require("./routers/user");
const adminRouter = require("./routers/admin");
const port = process.env.PORT;
require("./db/db");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(userRouter);
app.use(adminRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});