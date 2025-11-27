import { Options } from "sequelize";
import { env } from "./env";

const config: Options = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  dialect: "mysql",
  logging: false,
  timezone: "+09:00",
};

module.exports = config;
