import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import mongoose from "mongoose";
import errorMiddleware from "./error/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import ragRoutes from "./routes/ragRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "linkcube-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "LinkCube API is running 🚀" });
});

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/chat", chatRoutes);

// Error middleware (must be after all routes)
app.use(errorMiddleware);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
