import crypto from "node:crypto";
import cookie, { serialize } from "cookie";
import { EncryptJWT, importJWK, jwtDecrypt } from "jose";
import type { Pool, RowDataPacket } from "mysql2/promise";
import type { NextApiResponse } from "next";
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
  if (!rawCookie) return { currentUser: undefined, googleUser: undefined };

  const { userInfo } = cookie.parse(rawCookie || "");

  if (!userInfo) return { currentUser: undefined, googleUser: undefined };

  let currentUser: userInfo | undefined;
  try {
    const secret = await importJWK(
      { kty: "oct", k: process.env.JWT_TOKEN! },
      "A256GCM",
    );
    const { payload } = await jwtDecrypt(userInfo, secret);
    currentUser = payload as unknown as userInfo;
  } catch {
    return { currentUser: undefined, googleUser: undefined };
  }

  let googleUser: GoogleAuthInfo | undefined;

  if (getGoogle && dbConnection && currentUser?.id) {
    const [[rows]] = await dbConnection.query<
      (RowDataPacket & GoogleAuthInfo)[]
    >(
      "SELECT googleAccessToken, googleRefreshToken, googleName, googlePic, useGooglePic FROM users WHERE id = ?",
      [currentUser?.id],
    );

    if (rows?.googleAccessToken && rows?.googleRefreshToken) {
      const decryptedAccess = await decryptData(rows?.googleAccessToken ?? "");
      const decryptedRefresh = await decryptData(
        rows?.googleRefreshToken ?? "",
      );

      const decryptedGoogle: GoogleAuthInfo = {
        ...rows,
        googleAccessToken: decryptedAccess,
        googleRefreshToken: decryptedRefresh,
      };

      googleUser = decryptedGoogle;
    }
  }

  let bg: string | null = null;

  if (dbConnection) {
    const [[image]] = await dbConnection.query<RowDataPacket[]>(
      `SELECT background_image FROM users WHERE id = ?`,
      [currentUser.id],
    );

    bg = image?.background_image;
  }

  return {
    currentUser: { ...currentUser, background_image: bg },
    googleUser,
  };
}

export async function createEncryptedCookie(
  res: NextApiResponse,
  cookieName: string,
  payload: Record<string, unknown>,
  maxAge: number = 60 * 60 * 24 * 30,
) {
  const secret = await importJWK(
    { kty: "oct", k: process.env.JWT_TOKEN! },
    "A256GCM",
  );

  const token = await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setExpirationTime(`${maxAge}s`)
    .encrypt(secret);

  const cookie = serialize(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
}

export async function encryptData(value: string): Promise<string> {
  const secret = await importJWK(
    { kty: "oct", k: process.env.JWT_TOKEN! },
    "A256GCM",
  );
  return await new EncryptJWT({ v: value })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(secret);
}

export async function decryptData(encrypted: string): Promise<string> {
  const secret = await importJWK(
    { kty: "oct", k: process.env.JWT_TOKEN! },
    "A256GCM",
  );
  const { payload } = await jwtDecrypt(encrypted, secret);
  return payload.v as string;
}

/**
 * Hash email, password etc when usin info from frontend
 * @param emailPass
 * @returns
 */
export function hashEmailPass(emailPass: string): string {
  return crypto.createHash("sha256").update(emailPass).digest("hex");
}
