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

  const ensureEnv = (key: (typeof requiredEnvVars)[number]) => {
    const value = process.env[key];

    if (!value) {
      throw new Error(`필요한 환경변수 값이 누락되었습니다.: ${key}`);
    }

    return value;
  };

  const parseNumberEnv = (
    value: string | undefined,
    key: string,
    fallback?: number
  ) => {
    if (value === undefined || value === "") {
      if (fallback !== undefined) {
        return fallback;
      }

      throw new Error(`필요한 환경변수 값이 누락되었습니다.: ${key}`);
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new Error(`환경변수 ${key}는 숫자 형식이어야 합니다.`);
    }

    return parsed;
  };

  requiredEnvVars.forEach((envVar) => ensureEnv(envVar));

  return {
    NODE_ENV:
      (process.env.NODE_ENV as EnvVariables["NODE_ENV"]) || "development",
    PORT: parseNumberEnv(process.env.PORT, "PORT", 5000),
    DB_HOST: ensureEnv("DB_HOST"),
    DB_PORT: parseNumberEnv(process.env.DB_PORT, "DB_PORT"),
    DB_USER: ensureEnv("DB_USER"),
    DB_PASSWORD: ensureEnv("DB_PASSWORD"),
    DB_NAME: ensureEnv("DB_NAME"),
  };
}

export const env = validateEnv();
