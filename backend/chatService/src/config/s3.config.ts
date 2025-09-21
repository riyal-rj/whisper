import { S3Client } from "@aws-sdk/client-s3";
import { ENV_VARS } from "./env.config";

export const s3 = new S3Client({
  region: ENV_VARS.AWS_REGION,
  credentials: {
    accessKeyId: ENV_VARS.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV_VARS.AWS_SECRET_ACCESS_KEY,
  },
});