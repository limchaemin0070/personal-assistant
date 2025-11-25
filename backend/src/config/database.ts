import { Sequelize, Options } from "sequelize";
import { env } from "./env";

const config: Options = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  dialect: "mysql",
  logging: env.NODE_ENV === "development" ? console.log : false,
  timezone: "+09:00",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
};

const sequelize = new Sequelize(config);

export default sequelize;
