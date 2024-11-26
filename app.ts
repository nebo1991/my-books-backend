import express from "express";
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
import bodyParser from "body-parser";

const authRouter = require("./routes/auth.routes");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/", authRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
