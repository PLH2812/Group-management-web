const express = require("express");
const cookieParser = require("cookie-parser");
const rootRouter = require("./middleware/rootRouter");
const cors = require("cors");
const port = process.env.PORT;
require("./db/db");

const app = express();

app.use(cors({
  credentials: true,
  origin: [process.env.APP_URL, "http://localhost:5173"]
}))

app.use(express.json());
app.use(cookieParser());
app.use(rootRouter);



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});