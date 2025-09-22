import { getEnvVars } from "../utils/getEnv";

const envConfig = () => {
  const username = getEnvVars("MONGO_USERNAME");
  const password = getEnvVars("MONGO_PASSWORD");
  const database = getEnvVars("MONGO_DATABASE");

  let mongoUri = getEnvVars("MONGO_URI");

  mongoUri = mongoUri
    .replace("<db_userName>", encodeURIComponent(username))
    .replace("<db_password>", encodeURIComponent(password))
    .replace("<db_name>", database);

  return {
    NODE_ENV: getEnvVars("NODE_ENV", "development"),
    CORS_ORIGIN: getEnvVars("CORS_ORIGIN"),
    USER_SERVICE_URL: getEnvVars("USER_SERVICE"),

    MONGO_URI: mongoUri,


    JWT_SECRET: getEnvVars("JWT_SECRET"),
    JWT_EXPIRES_IN: getEnvVars("JWT_EXPIRES_IN"),

    CLOUDINARY_CLOUD_NAME: getEnvVars("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnvVars("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnvVars("CLOUDINARY_API_SECRET"),

    AWS_ACCESS_KEY_ID: getEnvVars("AWS_ACCESS_KEY_ID"),
    AWS_SECRET_ACCESS_KEY: getEnvVars("AWS_SECRET_ACCESS_KEY"),
    AWS_REGION: getEnvVars("AWS_REGION"),
    AWS_S3_BUCKET_NAME: getEnvVars("AWS_S3_BUCKET_NAME"),

    PORT: getEnvVars("PORT", "5002"),
  };
};

export const ENV_VARS = envConfig();
