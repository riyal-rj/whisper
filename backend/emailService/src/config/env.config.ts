import { getEnvVars } from "../utils/getEnv";

const envConfig = () => {
 
  return {
    NODE_ENV: getEnvVars("NODE_ENV", "development"),
    PORT: getEnvVars("PORT"),

    RABBITMQ_HOST: getEnvVars("Rabbitmq_Host"),
    RABBITMQ_USERNAME: getEnvVars("Rabbitmq_Username"),
    RABBITMQ_PASSWORD: getEnvVars("Rabbitmq_Password"),

    NODEMAILER_USER: getEnvVars("NODEMAILER_USER"),
    NODEMAILER_PASS: getEnvVars("NODEMAILER_PASS"),
  };
};

export const ENV_VARS = envConfig();