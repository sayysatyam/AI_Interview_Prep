const express = require("express");
const { connectMongoDb } = require("./connection");
const cookieParser = require("cookie-parser");
const authRouter = require("./router/user");
const cors = require("cors");
const app = express();
const path = require("path");
require("dotenv").config();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
connectMongoDb(process.env.MONGO_URL);


app.use("/auth",authRouter);

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "Frontend", "dist");

  app.use(express.static(distPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
app.listen(port,()=>{
    console.log(`Server started  with port ${port} 🚀`);
})