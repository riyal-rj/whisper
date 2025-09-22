// socket.ts
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5002"; // your backend socket server URL
export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});
