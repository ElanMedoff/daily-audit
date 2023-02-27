import express from "express";
import authRouter from "./routes/auth";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { init } from "./db/apiUtils";

(async function wrapper() {
  const app = express();
  const port = 8080;

  await init();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const root = process.env.NODE_ENV === "dev" ? "localhost:3000" : "";
  app.use(
    cors({
      origin: [
        `http://${root}`,
        `http://www.${root}`,
        `https://${root}`,
        `https://www.${root}`,
      ],
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
  if (process.env.NODE_ENV === "prod") {
    app.use(helmet());
    app.use(limiter);
  }
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api", authRouter);

  app.listen(port, () => {
    console.log(`api listening on port ${port}`);
  });

  app.all("*", (_, res) => {
    res.status(404);
  });
})();
