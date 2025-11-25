import dotenv from "dotenv";

dotenv.config();

interface EnvVariables {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

function validateEnv(): EnvVariables {
  const requiredEnvVars = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`필요한 환경변수 값이 누락되었습니다.: ${envVar}`);
    }
  }

  return {
    NODE_ENV:
      (process.env.NODE_ENV as EnvVariables["NODE_ENV"]) || "development",
    PORT: Number(process.env.PORT) || 5000,
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
  };
}

export const env = validateEnv();
