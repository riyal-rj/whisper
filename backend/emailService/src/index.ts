import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { ENV_VARS } from "./config/env.config";
import {
  startSendOTPConsumer,
  startSendVerificationSuccessConsumer,
} from "./consumer";

const app = express();

app.listen(ENV_VARS.PORT, () => {
  console.log(`Server is running on port ${ENV_VARS.PORT}`);
  startSendOTPConsumer();
  startSendVerificationSuccessConsumer();
});
