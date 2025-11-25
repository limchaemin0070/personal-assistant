import express, { Request, Response } from "express";
import cors from "cors";
import sequelize from "./config/database";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL 연결 성공 (${env.NODE_ENV})`);
    console.log(`연결된 DB: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);

    if (env.NODE_ENV === "development") {
      await sequelize.sync({ alter: false });
      console.log("데이터베이스 동기화 완료");
    }
  } catch (error) {
    console.error("MySQL 연결 실패:", error);
    process.exit(1);
  }
};

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API 서버 작동중",
    environment: env.NODE_ENV,
    database: {
      host: env.DB_HOST,
      name: env.DB_NAME,
    },
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
};

startServer();
