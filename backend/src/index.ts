import express, { type Request, type Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "테스트 서버입니다!" });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
