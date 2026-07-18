import{describe,it,expect,beforeAll,afterAll}from "vitest";
import request from "supertest";
import {app}from "../app.js";
import { prisma } from "../lib/prisma.js";
const email =`ws_${Date.now()}@example.com`;
const otherEmail =`ws_other_${Date.now()}@example.com`;
let token = "";
let otherToken = "";
let workspaceId = "";

async function registerAndLogin(e: string):Promise<string> {

    const res =  await request(app)
    .post("/api/auth/register")
    .send({ name: "Test", email: e, password: "password123" });
    return res.body.token;


    
}

afterAll(async()=>{
    await prisma.workspace.deleteMany({
        where:{ owner: {email:{in:[email,otherEmail]}}}

    });
    await prisma.user.deleteMany({
        where:{email:{in:[email,otherEmail]}}
    });
    await prisma.$disconnect();
});


describe("Workspace tests", () => {
    it("setup: register two users", async () => {
      token = await registerAndLogin(email);
      otherToken = await registerAndLogin(otherEmail);
      expect(token).toBeTruthy();
      expect(otherToken).toBeTruthy();
    });
    it("POST /api/workspaces — creates a workspace", async () => {
      const res = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "My Workspace" });
      expect(res.status).toBe(201);
      expect(res.body.workspace.name).toBe("My Workspace");
      workspaceId = res.body.workspace.id;
    });
    it("GET /api/workspaces — returns the workspace for owner", async () => {
      const res = await request(app)
        .get("/api/workspaces")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.workspaces.some((w: any) => w.id === workspaceId)).toBe(true);
    });
    it("GET /api/workspaces — other user does NOT see the workspace", async () => {
      const res = await request(app)
        .get("/api/workspaces")
        .set("Authorization", `Bearer ${otherToken}`);
      expect(res.status).toBe(200);
      expect(res.body.workspaces.some((w: any) => w.id === workspaceId)).toBe(false);
    });
    it("GET /api/workspaces — returns 401 without token", async () => {
      const res = await request(app).get("/api/workspaces");
      expect(res.status).toBe(401);
    });
    it("DELETE /api/workspaces/:id — other user cannot delete it", async () => {
      const res = await request(app)
        .delete(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${otherToken}`);
      expect(res.status).toBe(404);
    });
    it("DELETE /api/workspaces/:id — owner can delete it", async () => {
      const res = await request(app)
        .delete(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(204);
    });
  });
  


