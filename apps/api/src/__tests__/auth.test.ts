import { describe,it, expect, beforeAll,afterAll }from  "vitest";
import request from "supertest";
import {app}from "../app.js";
import {prisma} from "../lib/prisma.js";

const testEmail = `test_${Date.now()}@example.com`;
const testPassword = "password123";


afterAll(async()=>{
    await prisma.user.deleteMany({where:{email:testEmail}});
    await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
    it("creates a user and returns a token", async () => {
      const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: testEmail, password: testPassword });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(testEmail);

    });
    it("returns  409 if email already exists", async () => {
        const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test User", email: testEmail, password: testPassword });
        expect(res.status).toBe(409);
        
    });

});
describe("POST /api/auth/login", () => {
    it("returns a token with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPassword });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });
    it("returns 401 with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: "wrongpassword" });
      expect(res.status).toBe(401);
    });

  });


  describe("GET /api/auth/me", () => {
    it("returns 401 without a token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });



