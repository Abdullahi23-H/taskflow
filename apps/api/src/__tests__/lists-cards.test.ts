import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { prisma } from "../lib/prisma.js";

const email = `listcards_${Date.now()}@example.com`;
let token = "";
let workspaceId = "";
let boardId = "";
let listId = "";
let cardId = "";

async function registerAndLogin(e: string): Promise<string> {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test", email: e, password: "password123" });
  return res.body.token;
}

afterAll(async () => {
  await prisma.workspace.deleteMany({
    where: { owner: { email } },
  });
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

describe("Lists and cards tests", () => {
  it("setup: register user, create workspace and board", async () => {
    token = await registerAndLogin(email);
    const wsRes = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Workspace" });
    workspaceId = wsRes.body.workspace.id;

    const bRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Board" });
    boardId = bRes.body.board.id;

    expect(workspaceId).toBeTruthy();
    expect(boardId).toBeTruthy();
  });

  it("POST /lists — creates a list", async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To Do" });

    expect(res.status).toBe(201);
    expect(res.body.list.name).toBe("To Do");
    listId = res.body.list.id;
  });

  it("GET /lists — returns the list", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.lists.some((l: any) => l.id === listId)).toBe(true);
  });

  it("POST /cards — creates a card", async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "First task" });

    expect(res.status).toBe(201);
    expect(res.body.card.title).toBe("First task");
    expect(res.body.card.status).toBe("todo");
    cardId = res.body.card.id;
  });

  it("GET /cards — returns the card", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.cards.some((c: any) => c.id === cardId)).toBe(true);
  });

  it("DELETE /cards/:id — deletes the card", async () => {
    const res = await request(app)
      .delete(`/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("DELETE /lists/:id — deletes the list", async () => {
    const res = await request(app)
      .delete(`/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});