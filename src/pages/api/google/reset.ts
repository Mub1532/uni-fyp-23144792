import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const rawCookie = req.headers.cookie;
  if (!rawCookie)
    return res.status(401).json({ code: USER_CODES.NOT_LOGGED_IN });

  const connection = await getDBConnection();
  const { currentUser } = await verifyUser(rawCookie, connection);

  if (!currentUser)
    return res.status(401).json({ code: USER_CODES.NOT_LOGGED_IN });

  const [result] = await connection.query<ResultSetHeader>(
    `UPDATE users SET
      googleAccessToken = NULL,
      googleLastSync = NULL,
      googleName = NULL,
      googlePic = NULL,
      googleRefreshToken = NULL
     WHERE id = ?`,
    [currentUser.id],
  );

  if (result.affectedRows !== 1)
    return res.status(500).json({ success: false });

  return res.status(200).json({ success: true });
}
