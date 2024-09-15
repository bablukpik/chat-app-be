require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const socketServer = require("./socketServer");
const authRoutes = require("./routes/authRoutes");
const friendInvitationRoutes = require("./routes/friendInvitationRoutes");

const {
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_DATABASE,
  IS_DOCKER,
} = process.env;

const MONGODB_HOST_DOCKER = 'mongo';
const MONGODB_HOST_LOCAL = MONGODB_HOST || 'localhost';
const DB_HOST = IS_DOCKER === 'true' ? MONGODB_HOST_DOCKER : MONGODB_HOST_LOCAL;

const MONGODB_URI = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${DB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`;
const PORT = process.env.PORT || 5002;

const app = express();

app.use(express.json());
app.use(cors());

// Set Mongoose strictQuery option
mongoose.set("strictQuery", true);

// Connect to MongoDB
if (!MONGODB_URI) {
  console.error(
    "MongoDB connection string is not defined in environment variables"
  );
  process.exit(1);
}

console.log("Connecting to MongoDB...");
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    const server = http.createServer(app);
    socketServer.registerSocketServer(server);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed. Server not started", err);
    process.exit(1);
  });

// register the routes
app.use("/api/auth", authRoutes);
app.use("/api/friend-invitation", friendInvitationRoutes);
