import { Sequelize, Options } from "sequelize";
import { env } from "./env";

const config: Options = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  dialect: "mysql",
  logging:
    env.NODE_ENV === "development"
      ? (msg: string) => console.debug(`[Sequelize] ${msg}`)
      : false,
  timezone: "+09:00",
};

const sequelize = new Sequelize(config);

export default sequelize;

module.exports = config;
