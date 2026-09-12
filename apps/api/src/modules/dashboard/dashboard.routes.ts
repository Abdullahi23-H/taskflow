import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/", async (req, res) => {
  try {
    const cards = await prisma.card.findMany({
      where: {
        list: {
          board: {
            workspace: { ownerId: req.userId! },
          },
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        position: true,
        list: {
          select: {
            id: true,
            name: true,
            board: {
              select: {
                id: true,
                name: true,
                workspace: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const stats = {
      total: cards.length,
      todo: cards.filter((c) => c.status === "todo").length,
      inProgress: cards.filter((c) => c.status === "in_progress").length,
      done: cards.filter((c) => c.status === "done").length,
      overdue: cards.filter((c) => c.dueDate && new Date(c.dueDate) < now && c.status !== "done").length,
    };

    return res.json({ stats, cards });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});