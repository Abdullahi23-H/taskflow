import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const searchRouter = Router();

searchRouter.use(authMiddleware);

searchRouter.get("/", async (req, res) => {
  try {
    const { q } = z.object({ q: z.string().min(1).max(200) }).parse(req.query);

    const cards = await prisma.card.findMany({
      where: {
        title: { contains: q },
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
      take: 10,
    });

    return res.json({ cards });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Query is required" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
