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
    PORT: getEnvVars("PORT"),

    MONGO_URI: mongoUri,
    REDIS_URL: getEnvVars("REDIS_URL"),

    RABBITMQ_HOST: getEnvVars("Rabbitmq_Host"),
    RABBITMQ_USERNAME: getEnvVars("Rabbitmq_Username"),
    RABBITMQ_PASSWORD: getEnvVars("Rabbitmq_Password"),

    JWT_SECRET: getEnvVars("JWT_SECRET", "secret_jwt"),
    JWT_EXPIRES_IN: getEnvVars("JWT_EXPIRES_IN", "1d"),

    FRONTEND_URL: getEnvVars("FRONTEND_URL", "http://localhost:3000"),
  };
};

export const ENV_VARS = envConfig();