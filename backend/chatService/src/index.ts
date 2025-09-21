import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import { ENV_VARS } from "./config/env.config";
import { connectDatabase, disconnectDatabase } from "./config/db.config";
import { initSocket } from "./config/socket.config";
import chatRouter from "./routes/chat.route";

const app = express();
const server = http.createServer(app);

initSocket(server);


app.use(express.json());

app.use("/api/v1/chat", chatRouter);

async function startServer() {
  try {
    await connectDatabase();
    
    server.listen(ENV_VARS.PORT, () => {
      console.log(
        `Server is running on port ${ENV_VARS.PORT} in ${ENV_VARS.NODE_ENV} mode`
      );
    });

    const shutDownSignals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];

    shutDownSignals.forEach((signal) => {
      process.on(signal, async () => {
        try {
          console.log(`${signal} received: shutting down gracefully`);
          server.close(async () => {
            console.log(`HTTP server closed`);
            await disconnectDatabase();
            process.exit(0);
          });
        } catch (error) {
          console.log(
            `Error occurred while shutting down the server: ${error}`
          );
          process.exit(1);
        }
      });
    });
  } catch (error) {
    console.log(`Failed to start the server`, error);
    process.exit(1);
  }
}

startServer();