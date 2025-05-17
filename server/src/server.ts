import express, { Application, Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./config/db";
import customerTrafficRoutes from "./routes/customerTrafficRoutes";
import { KafkaSimulator } from "./services/KafkaSimulator";

// Load env vars
dotenv.config();

// Initialize express
const app: Application = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Root route for API health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Store Traffic API is running",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Diagnostics route
app.get("/api/status", (req: Request, res: Response) => {
  res.json({
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    server: {
      uptime: process.uptime(),
      timestamp: Date.now(),
      mongodb: mongoose.connection.readyState,
    },
  });
});

// Routes
app.use("/api/traffic", customerTrafficRoutes);

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize Kafka simulator
const kafkaSimulator = new KafkaSimulator(io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Send immediate welcome message
  socket.emit("welcome", {
    message: "Connected to Store Traffic Server",
    timestamp: new Date().toISOString(),
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Start Kafka simulator after server is running
  kafkaSimulator.start(10 * 1000); // Emit event every 10 seconds
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
