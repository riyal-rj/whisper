import dotenv from "dotenv";

dotenv.config();

import express from "express";
import { ENV_VARS } from "./config/env.config";
import cors from "cors";
import morgan from "morgan";
import { connectDatabase, disconnectDatabase } from "./config/db.config";
import { connectToRedis } from "./config/redis.config";
import userRouter from "./routes/user.route";
import { connectToRabbitMQ } from "./config/rabbitmq.config";
const app = express();

app.use(cors(
  {
    origin: ENV_VARS.FRONTEND_URL,
    credentials: true,
  }
));
app.use(express.json());
if(ENV_VARS.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1", userRouter);
async function startServer() {
  try {
    await connectDatabase();
    await connectToRedis();
    await connectToRabbitMQ();

    const server = app.listen(ENV_VARS.PORT, () => {
      console.log(
        `Server is running on port ${ENV_VARS.PORT} in ${ENV_VARS.NODE_ENV} mode`
      );
    });

    const shutDownSignals = ["SIGTERM", "SIGINT"];

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