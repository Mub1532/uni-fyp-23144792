import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  res.setHeader(
    "Set-Cookie",
    serialize("userInfo", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    }),
  );

  res.status(200).json({ success: true, code: USER_CODES.LOGGED_OUT });
}
