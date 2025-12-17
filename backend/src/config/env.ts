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

  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  REDIS_URL?: string;
}

function validateEnv(): EnvVariables {
  const nodeEnv =
    (process.env.NODE_ENV as EnvVariables["NODE_ENV"]) || "development";
  const isTest = nodeEnv === "test";

  // MYSQL_URL 파싱 (Railway에서 제공하는 경우)
  const parsedMysqlUrl: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
  } = {};

  const mysqlUrl = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;
  if (mysqlUrl) {
    try {
      const url = new URL(mysqlUrl);
      if (url.hostname) parsedMysqlUrl.host = url.hostname;
      if (url.port) parsedMysqlUrl.port = parseInt(url.port);
      if (url.username) parsedMysqlUrl.user = url.username;
      if (url.password) parsedMysqlUrl.password = url.password;
      const dbName = url.pathname.replace(/^\//, "");
      if (dbName) parsedMysqlUrl.database = dbName;
    } catch (error) {
      console.warn("MYSQL_URL 파싱 실패:", error);
    }
  }

  const getEnv = (key: string, testDefault: string, fallbackKey?: string) => {
    if (isTest) {
      return process.env[key] || process.env[fallbackKey || ""] || testDefault;
    }

    const value = process.env[key] || process.env[fallbackKey || ""];
    if (!value) {
      throw new Error(
        `필요한 환경변수 값이 누락되었습니다.: ${key}${
          fallbackKey ? ` 또는 ${fallbackKey}` : ""
        }`
      );
    }
    return value;
  };

  const getNumberEnv = (
    key: string,
    testDefault: number,
    fallbackKey?: string
  ) => {
    if (isTest) {
      const value = process.env[key] || process.env[fallbackKey || ""];
      return value ? parseInt(value) : testDefault;
    }

    const value = process.env[key] || process.env[fallbackKey || ""];
    if (!value) {
      throw new Error(
        `필요한 환경변수 값이 누락되었습니다.: ${key}${
          fallbackKey ? ` 또는 ${fallbackKey}` : ""
        }`
      );
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
    // 우선순위: MYSQL_URL 파싱 > Railway 형식(MYSQL_*) > 기존 형식(DB_*)
    DB_HOST:
      parsedMysqlUrl.host || getEnv("MYSQL_HOST", "127.0.0.1", "DB_HOST"),
    DB_PORT: parsedMysqlUrl.port ?? getNumberEnv("MYSQL_PORT", 3306, "DB_PORT"),
    DB_USER: parsedMysqlUrl.user || getEnv("MYSQL_USER", "root", "DB_USER"),
    DB_PASSWORD:
      parsedMysqlUrl.password ||
      getEnv("MYSQL_PASSWORD", "test", "DB_PASSWORD"),
    DB_NAME:
      parsedMysqlUrl.database || getEnv("MYSQL_DATABASE", "test_db", "DB_NAME"),

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

    JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET", "test-access-secret-key"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "test-refresh-secret-key"),
    JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
    JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),

    REDIS_URL: getEnv("REDIS_URL", ""),
  };
}

export const env = validateEnv();
