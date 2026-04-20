import { NOTE_CODES } from "@/types/notes";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection, insertHelper } from "@/utils/database";
import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const { note } = req.body;

  const rawCookie = req.headers.cookie;
  const user = await verifyUser(rawCookie as string);

  if (!user)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });

  const connection = await getDBConnection();

  try {
    const { sql, values } = insertHelper("notes", {
      user_id: user?.id,
      note: JSON.stringify(note),
    });

    const [result] = await connection.query<ResultSetHeader>(sql, values);

    const success = result.affectedRows === 1;

    if (success) {
      const noteID = result?.insertId;

      return res.status(200).send({
        code: NOTE_CODES.SAVE_SUCCESS,
        noteID,
      });
    } else
      return res.status(200).send({
        code: NOTE_CODES.SAVE_FAIL,
      });
  } catch (_) {
    return res.status(200).send({
      code: NOTE_CODES.SAVE_FAIL,
    });
  }
}
