const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "API is running...", status: "success" });
});

// Create raw HTTP server from the Express app
const httpServer = http.createServer(app);

// Attach Socket.io to that same server
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
  },
});

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join a specific interview "room" so events only go to people in that session
  socket.on("join_interview", (interviewId) => {
    socket.join(interviewId);
    console.log(`Socket ${socket.id} joined room ${interviewId}`);
  });

  // Server-driven timer: client tells server to start a timer for a question
  socket.on("start_timer", ({ interviewId, duration }) => {
    let timeLeft = duration;

    const interval = setInterval(() => {
      timeLeft -= 1;
      io.to(interviewId).emit("timer_tick", timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
        io.to(interviewId).emit("timer_ended");
      }
    }, 1000);

    // Store interval on socket so we can clear it if needed (e.g., user manually advances)
    socket.currentTimer = interval;
  });

  // Client manually moved to next question before timer ended
  socket.on("stop_timer", () => {
    if (socket.currentTimer) {
      clearInterval(socket.currentTimer);
    }
  });

  // Broadcast live answer updates (e.g., for a future "watch live" feature)
  socket.on("answer_update", ({ interviewId, questionId, answerText }) => {
    socket.to(interviewId).emit("answer_updated", { questionId, answerText });
  });

  socket.on("disconnect", () => {
    if (socket.currentTimer) clearInterval(socket.currentTimer);
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});