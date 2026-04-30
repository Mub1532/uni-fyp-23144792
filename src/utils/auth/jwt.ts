import crypto from "node:crypto";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import type { Pool, RowDataPacket } from "mysql2/promise";
import type { GoogleAuthInfo, userInfo } from "@/types/user";

type userVerify = {
  currentUser: userInfo | undefined;
  googleUser: GoogleAuthInfo | undefined;
};
/**
 * Function to verify user properly
 * @param rawCookie
 * @returns
 */
export default async function verifyUser(
  rawCookie: string,
  dbConnection?: Pool,
  getGoogle: boolean = false,
): Promise<userVerify> {
  if (!rawCookie)
    return {
      currentUser: undefined,
      googleUser: undefined,
    };

  const { userInfo } = cookie.parse(rawCookie || "");
  const token = userInfo;

  if (!token)
    return {
      currentUser: undefined,
      googleUser: undefined,
    };

  const currentUser = jwt.verify(token, process.env.JWT_TOKEN!) as
    | userInfo
    | undefined;

  let googleUser: GoogleAuthInfo | undefined;

  if (getGoogle && dbConnection && currentUser?.id) {
    const [rows] = await dbConnection.query<RowDataPacket[]>(
      "SELECT googleAccessToken, googleRefreshToken, googleName, googlePic FROM users WHERE id = ?",
      [currentUser?.id],
    );

    googleUser = rows[0] as GoogleAuthInfo;
  }

  return {
    currentUser,
    googleUser,
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
