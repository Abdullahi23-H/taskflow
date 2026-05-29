import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  throw new Error("JWT_SECRET is missing in .env or is too short");
}

export function signAccessToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: "15m" });
}

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return { sub: decoded.sub, email: decoded.email };
}
