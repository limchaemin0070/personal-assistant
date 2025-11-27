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

  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_SECURE: boolean;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
}

function validateEnv(): EnvVariables {
  const nodeEnv =
    (process.env.NODE_ENV as EnvVariables["NODE_ENV"]) || "development";
  const isTest = nodeEnv === "test";

  const getEnv = (key: string, testDefault: string) => {
    if (isTest) return process.env[key] || testDefault;

    const value = process.env[key];
    if (!value) {
      throw new Error(`필요한 환경변수 값이 누락되었습니다.: ${key}`);
    }
    return value;
  };

  const getNumberEnv = (key: string, testDefault: number) => {
    if (isTest) {
      return process.env[key] ? parseInt(process.env[key]!) : testDefault;
    }

    const value = process.env[key];
    if (!value) {
      throw new Error(`필요한 환경변수 값이 누락되었습니다.: ${key}`);
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`환경변수 ${key}는 숫자 형식이어야 합니다.`);
    }
    return parsed;
  };

  return {
    NODE_ENV: nodeEnv,
    PORT: getNumberEnv("PORT", 5000),
    DB_HOST: getEnv("DB_HOST", "127.0.0.1"),
    DB_PORT: getNumberEnv("DB_PORT", 3306),
    DB_USER: getEnv("DB_USER", "root"),
    DB_PASSWORD: getEnv("DB_PASSWORD", "test"),
    DB_NAME: getEnv("DB_NAME", "test_db"),

    EMAIL_HOST: getEnv("EMAIL_HOST", "smtp.ethereal.email"),
    EMAIL_PORT: getNumberEnv("EMAIL_PORT", 587),
    EMAIL_SECURE: isTest
      ? (process.env.EMAIL_SECURE ?? "false") === "true"
      : process.env.EMAIL_SECURE === "true",
    EMAIL_USER: getEnv("EMAIL_USER", "test@example.com"),
    EMAIL_PASSWORD: getEnv("EMAIL_PASSWORD", "test_password"),
    EMAIL_FROM: isTest
      ? "Personal Assistant <test@example.com>"
      : process.env.EMAIL_FROM ||
        `Personal Assistant <${process.env.EMAIL_USER}>`,
  };
}

export const env = validateEnv();
