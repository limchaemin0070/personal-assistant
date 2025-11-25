import express, { Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

export default app;
