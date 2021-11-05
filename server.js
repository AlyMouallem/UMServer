import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/auth.js";
import { readdirSync } from "fs";
import cookieParser from "cookie-parser";
import compress from "compression";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
//
//db
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("DB connection error => ", err));

//middlewares

app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/", authRoutes);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ": " + err.message });
  } else if (err) {
    res.status(400).json({ error: err.name + ": " + err.message });
    console.log(err);
  }
});

//auto load routes
readdirSync("./routes").map((r) => app.use("", router));

//server listen
// const port = 8000;
app.listen(process.env.PORT || 3000, () =>
  console.log(`Server running on port ${port}`)
);
