import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env");
}

const url = new URL(DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
});

export const prisma = new PrismaClient({ adapter });
