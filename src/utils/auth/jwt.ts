import type { userInfo } from "@/types/user";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

/**
 * Function to verify user properly
 * @param rawCookie
 * @returns
 */
export default async function verifyUser(
  rawCookie: string,
): Promise<userInfo | undefined> {
  if (!rawCookie) return;

  const { userInfo } = cookie.parse(rawCookie || "");
  const token = userInfo;

  if (!token) return;

  const payload = jwt.verify(token, process.env.JWT_TOKEN!) as
    | userInfo
    | undefined;

  return payload;
}

/**
 * Hash email, password etc when usin info from frontend
 * @param emailPass
 * @returns
 */
export function hashEmailPass(emailPass: string): string {
  return crypto.createHash("sha256").update(emailPass).digest("hex");
}
