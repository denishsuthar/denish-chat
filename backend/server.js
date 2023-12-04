import app from "./app.js";
import connectDB from "./config/database.js";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import cloudinary from "cloudinary"

connectDB();

let server;

server = createServer(app);

// Cloudinary Config
cloudinary.v2.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
})

const io = new SocketIOServer(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
  });
});

export const socketIo = io;

server.listen(process.env.PORT, () => {
  console.log(`Server is Working on ${process.env.PORT}`);
});
