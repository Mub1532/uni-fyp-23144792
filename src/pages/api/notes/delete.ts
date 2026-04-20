import { NOTE_CODES } from "@/types/notes";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const { noteID } = req.body;

  const rawCookie = req.headers.cookie;
  const user = await verifyUser(rawCookie as string);

  if (!user)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });

  const connection = await getDBConnection();

  try {
    const [result] = await connection.query<ResultSetHeader>(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [noteID, user?.id],
    );

    const success = result.affectedRows === 1;

    if (success)
      return res.status(200).send({
        code: NOTE_CODES.DELETE_SUCCESS,
      });
    else
      return res.status(200).send({
        code: NOTE_CODES.DELETE_FAIL,
      });
  } catch (_) {
    return res.status(200).send({
      code: NOTE_CODES.DELETE_FAIL,
    });
  }
}
