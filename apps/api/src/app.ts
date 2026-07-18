import express from "express";
import "dotenv/config";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes.js";
import { workspacesRouter } from "./modules/workspaces/workspaces.routes.js";

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "caadi", service: "taskflow-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/workspaces", workspacesRouter);