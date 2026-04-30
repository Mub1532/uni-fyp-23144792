import { NOTE_CAL_CODES } from "@/types/notes";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection, insertHelper } from "@/utils/database";
import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const { title, description, start, end } = req.body;

  const rawCookie = req.headers.cookie;
  const user = await verifyUser(rawCookie as string);

  if (!user)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });

  const connection = await getDBConnection();

  try {
    const { sql, values } = insertHelper("calendar_items", {
      user_id: user?.id,
      title,
      description,
      start_time: new Date(start),
      end_time: new Date(end),
      type: "MANUAL",
    });

    const [result] = await connection.query<ResultSetHeader>(sql, values);

    console.log(result);

    const success = result.affectedRows === 1;

    if (success) {
      const calendarID = result?.insertId;

      return res.status(200).send({
        code: NOTE_CAL_CODES.SAVE_SUCCESS,
        calendarID,
      });
    } else
      return res.status(200).send({
        code: NOTE_CAL_CODES.SAVE_FAIL,
      });
  } catch (err) {
    console.log(err);
    return res.status(200).send({
      code: NOTE_CAL_CODES.SAVE_FAIL,
    });
  }
}
