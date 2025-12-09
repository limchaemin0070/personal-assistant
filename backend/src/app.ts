import express, { Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import scheduleRoutes from "./routes/schedule.routes";
import reminderRoutes from "./routes/reminder.routes";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/schedules", scheduleRoutes);
app.use("/reminders", reminderRoutes);

// 404 핸들러 - 등록되지 않은 라우트 처리
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `라우트를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`,
    },
  });
});

app.use(errorHandler);

export default app;
