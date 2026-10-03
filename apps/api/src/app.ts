import express from "express";
import "dotenv/config";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes.js";
import { workspacesRouter } from "./modules/workspaces/workspaces.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { searchRouter } from "./modules/search/search.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
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
app.use("/api/dashboard", dashboardRouter);
app.use("/api/search", searchRouter);
app.use("/api/users", usersRouter);
