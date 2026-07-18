import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { prisma } from "../lib/prisma.js";

const email = `boards_${Date.now()}@example.com`;
const otherEmail = `boards_other_${Date.now()}@example.com`;
let token = "";
let otherToken = "";
let workspaceId = "";
let boardId = "";

async function registerAndLogin(e: string): Promise<string> {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test", email: e, password: "password123" });
  return res.body.token;
}

afterAll(async () => {
  await prisma.workspace.deleteMany({
    where: { owner: { email: { in: [email, otherEmail] } } },
  });
  await prisma.user.deleteMany({ where: { email: { in: [email, otherEmail] } } });
  await prisma.$disconnect();
});

describe("Board tests", () => {
  it("setup: register users and create workspace", async () => {
    token = await registerAndLogin(email);
    otherToken = await registerAndLogin(otherEmail);
    const res = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Board Test Workspace" });
    workspaceId = res.body.workspace.id;
    expect(workspaceId).toBeTruthy();
  });

  it("POST /boards — creates a board", async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Sprint 1" });

    expect(res.status).toBe(201);
    expect(res.body.board.name).toBe("Sprint 1");
    boardId = res.body.board.id;
  });

  it("GET /boards — lists boards for owner", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.boards.some((b: any) => b.id === boardId)).toBe(true);
  });

  it("GET /boards — other user gets 404 (wrong workspace)", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });

  it("DELETE /boards/:id — other user cannot delete", async () => {
    const res = await request(app)
      .delete(`/api/workspaces/${workspaceId}/boards/${boardId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });

  it("DELETE /boards/:id — owner can delete", async () => {
    const res = await request(app)
      .delete(`/api/workspaces/${workspaceId}/boards/${boardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});