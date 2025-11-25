import app from "./app";
import sequelize from "./config/database";
import { env } from "./config/env";

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL 연결 성공 (${env.NODE_ENV})`);
    console.log(`연결된 DB: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
    // 추후에 마이그레이션 sequelize-cli로 관리 예정
  } catch (error) {
    console.error("MySQL 연결 실패:", error);
    throw error;
  }
};

export const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("서버 시작 실패:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}
