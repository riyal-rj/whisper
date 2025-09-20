import dotenv from "dotenv";
dotenv.config();

export const getEnvVars = (name: string, fallback?: string): string => {
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (fallback) {
    return fallback;
  }
  throw new Error(`Environment variable ${name} is not defined`);
};