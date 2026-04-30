import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { NOTE_CAL_CODES } from "@/types/notes";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const { calendarID, title, description, start, end } = req.body;

  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });

  const connection = await getDBConnection();

  try {
    const [result] = await connection.query<ResultSetHeader>(
      "UPDATE calendar_items SET title = ?, description = ?, start_time = ?, end_time = ? WHERE id = ? AND user_id = ?",
      [
        title,
        description,
        new Date(start),
        new Date(end),
        calendarID,
        currentUser?.id,
      ],
    );

    const success = result.affectedRows === 1;

    if (success)
      return res.status(200).send({
        code: NOTE_CAL_CODES.SAVE_SUCCESS,
      });
    else
      return res.status(200).send({
        code: NOTE_CAL_CODES.SAVE_FAIL,
      });
  } catch (_) {
    return res.status(200).send({
      code: NOTE_CAL_CODES.SAVE_FAIL,
    });
  }
}
