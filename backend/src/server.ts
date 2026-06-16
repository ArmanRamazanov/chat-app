import "dotenv/config";
import connectDB from "@/config/dbConnection";
import app from "./app";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket";

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

initializeSocket(io);

const PORT = process.env.PORT || 3000;

connectDB((err) => {
  if (!err) {
    server.listen(PORT, () => {
      console.log(`The server is running on port: ${PORT}`);
    });
  }
});
