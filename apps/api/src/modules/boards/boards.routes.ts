import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { listsRouter } from "../lists/lists.routes.js";

export const boardsRouter = Router({ mergeParams: true });

const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
});

boardsRouter.use(authMiddleware);
boardsRouter.use("/:boardId/lists", listsRouter);

// POST /api/workspaces/:workspaceId/boards
boardsRouter.post("/", async (req, res) => {
  try {
    const workspaceId = (req.params as any).workspaceId as string;
    const body = createBoardSchema.parse(req.body);

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: req.userId!,
      },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const board = await prisma.board.create({
      data: {
        name: body.name,
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        name: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({ board });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/workspaces/:workspaceId/boards
boardsRouter.get("/", async (req, res) => {
  try {
    const workspaceId = (req.params as any).workspaceId as string;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: req.userId!,
      },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const boards = await prisma.board.findMany({
      where: { workspaceId: workspace.id },
      select: {
        id: true,
        name: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ boards });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/workspaces/:workspaceId/boards/:boardId
boardsRouter.delete("/:boardId", async (req, res) => {
  try {
    const workspaceId = (req.params as any).workspaceId as string;
    const { boardId } = req.params;

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        workspace: { id: workspaceId, ownerId: req.userId! },
      },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    await prisma.board.delete({ where: { id: boardId } });

    return res.json({ message: "Board deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});