import crypto from "node:crypto";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";
import type { GoogleAuthInfo, userInfo } from "@/types/user";
import { getDBConnection } from "../database";

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

export async function verifyGoogleAuth(
  userID?: number,
): Promise<GoogleAuthInfo | undefined> {
  if (!userID) return;

  const connection = await getDBConnection();
  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT google_access_token, google_refresh_token, google_name, google_pic FROM users WHERE id = ?",
    [userID],
  );

  const user = rows[0];
  if (!user?.google_access_token) return undefined;

  return {
    googleAccessToken: user.google_access_token,
    googleRefreshToken: user.google_refresh_token,
    googleName: user.google_name,
    googlePic: user.google_pic,
  };
}

/**
 * Hash email, password etc when usin info from frontend
 * @param emailPass
 * @returns
 */
export function hashEmailPass(emailPass: string): string {
  return crypto.createHash("sha256").update(emailPass).digest("hex");
}
