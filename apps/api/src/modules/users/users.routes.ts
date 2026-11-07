import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
export const usersRouter = Router();
usersRouter.use(authMiddleware);

usersRouter.get("/", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      });
      return res.json({ users });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

