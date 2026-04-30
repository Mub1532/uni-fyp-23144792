import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const rawCookie = req.headers.cookie;

  if (!rawCookie) return res.status(401).json({ loggedIn: false });

  const connection = await getDBConnection();

  const { currentUser, googleUser } = await verifyUser(
    rawCookie,
    connection,
    true,
  );

  if (!currentUser) return res.status(401).json({ loggedIn: false });

  res.status(200).json({
    loggedIn: true,
    user: currentUser,
    googleUsername: googleUser?.googleName,
    googlePic: googleUser?.googlePic,
    useGooglePic: !!googleUser?.useGooglePic,
  });
}
