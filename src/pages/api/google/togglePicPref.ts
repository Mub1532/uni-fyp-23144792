import type { ResultSetHeader } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const rawCookie = req.headers.cookie;
  const { newValue } = req.body;

  if (!rawCookie)
    return res
      .status(401)
      .json({ success: false, code: USER_CODES.NOT_LOGGED_IN });

  const { currentUser } = await verifyUser(rawCookie);

  if (!currentUser)
    return res
      .status(401)
      .json({ success: false, code: USER_CODES.NOT_LOGGED_IN });

  const connection = await getDBConnection();

  const [result] = await connection.query<ResultSetHeader>(
    "UPDATE users SET useGooglePic = ? WHERE id = ?",
    [newValue ? 1 : 0, currentUser?.id],
  );

  const success = result.affectedRows === 1;

  if (!success)
    return res.status(500).json({
      success: false,
      code: USER_CODES.SAVE_FAIL,
    });

  res.status(200).json({
    success: true,
    code: USER_CODES.SAVE_SUCCESS,
  });
}
