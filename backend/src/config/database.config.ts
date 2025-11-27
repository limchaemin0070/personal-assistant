require("dotenv").config();

const config = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  database: process.env.DB_NAME || "test_db",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  dialect: "mysql",
  logging: false,
  timezone: "+09:00",
};

module.exports = config;
