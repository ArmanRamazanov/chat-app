import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routes/registration";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json("healthy");
});

app.use("/api", router);
app.use(errorHandler);

export default app;
