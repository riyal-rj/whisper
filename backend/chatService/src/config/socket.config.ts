import { Server } from "socket.io";
import http from "http";
import { ENV_VARS } from "./env.config";

let io: Server;
const userSocketMap = new Map<string, string>();

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: ENV_VARS.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId as string;
    if (userId) {
      userSocketMap.set(userId, socket.id);
    }
    socket.on("joinChat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    });
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      if (userId) {
        userSocketMap.delete(userId);
      }
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap.get(receiverId);
};

export { io };
