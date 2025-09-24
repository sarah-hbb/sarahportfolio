import express, { Request, Response, Express, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { AppError } from "./src/utils/AppError.types";
// Importing routes
import userRoutes from "./src/routes/user.routes";
import authRoutes from "./src/routes/auth.routes";
import postRoutes from "./src/routes/post.routes";
import commentRoutes from "./src/routes/comment.routes";
//import summaryRoutes from "./src/routes/summary.routes";
import cookieParser from "cookie-parser";
import path from "path";
import cors, { CorsOptions } from "cors";

const app: Express = express();

// 💣💣💣💣💣💣 later change the url to whatever you host the website
let corsOption: CorsOptions = {
  origin: "http://sarah-habibi.com",
};
app.use(cors(corsOption));

dotenv.config();

app.use(express.json());

const dataBaseConnect = async () => {
  const mongoDbConnection = process.env.MONGO_DB_CONNECTION;
  if (!mongoDbConnection) {
    throw new Error("MONGO_DB_CONNECTION environment variable is not defined.");
  }
  try {
    await mongoose.connect(mongoDbConnection);
    console.log("Connected to the database");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
dataBaseConnect();
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

// to use json format for input of the backend
app.use(express.json());

app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
//app.use("/api/summary", summaryRoutes);

app.use(express.static(path.join(__dirname, "../client/build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error!";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
