import mongoose from "mongoose";
import { ENV_VARS } from "./env.config";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(ENV_VARS.MONGO_URI);
    console.log("Connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from the database");
  } catch (error) {
    console.error("Failed to disconnect from the database", error);
  }
};