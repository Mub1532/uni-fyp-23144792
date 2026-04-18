import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser from "@/utils/auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const rawCookie = req.headers.cookie;

  if (!rawCookie) return res.status(401).json({ loggedIn: false });

  const payload = await verifyUser(rawCookie);

  if (!payload) return res.status(401).json({ loggedIn: false });

  res.status(200).json({ loggedIn: true, user: payload });
}
