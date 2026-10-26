import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";
import dns from "node:dns";

import router from "./routes/auth.js";
import { messageRouter } from "./routes/messages.js";

dotenv.config();

// Use Google's DNS to resolve MongoDB SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", router);
app.use("/api/auth/message", messageRouter);

// Create a Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Track connected users
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("UserOnline", (username) => {
    userSocketMap[username] = socket.id;

    io.emit("onlineUsers", Object.keys(userSocketMap));
  });

  socket.on("senderMessage", (data) => {
    const receiverSocketId = userSocketMap[data.receiver];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", data);
    }

    // Send the message back to the sender
    socket.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    for (const [username, id] of Object.entries(userSocketMap)) {
      if (id === socket.id) {
        delete userSocketMap[username];
        break;
      }
    }

    io.emit("onlineUsers", Object.keys(userSocketMap));
    console.log("User Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();