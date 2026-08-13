import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);

const app = express();

connectDB();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Vercel runs this app as a serverless function via api/index.js and sets
// the VERCEL env var; only bind a local listener outside that environment.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("server is running on PORT:" + PORT);
  });
}

export default app;
