import mongoose from "mongoose";
import { ENV_VARS } from "../config/env.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(ENV_VARS.MONGO_URI);
    console.log(`Connected to MongoDB Database successfully `);
  } catch (error) {
    console.log(`Error while connecting to MongoDB Database`, error);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log(`Disconnected from MongoDB Database successfully`);
  } catch (error) {
    console.log(`Error while disconnecting from MongoDB Database`, error);
    process.exit(1);
  }
};

export { connectDatabase, disconnectDatabase };
