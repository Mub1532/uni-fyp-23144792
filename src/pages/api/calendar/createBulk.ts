import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { NOTE_CAL_CODES } from "@/types/notes";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection, insertHelperBulk } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser)
    return res.status(401).send({ code: USER_CODES.NOT_LOGGED_IN });

  const events: {
    title: string;
    description: string;
    start: string;
    end: string;
  }[] = req.body;

  if (!events?.length)
    return res.status(400).send({ code: USER_CODES.INFO_NOT_ENTERED });

  const connection = await getDBConnection();

  try {
    const rows = events.map(({ title, description, start, end }) => ({
      user_id: currentUser.id,
      title,
      description,
      start_time: new Date(start),
      end_time: new Date(end),
      type: "AI",
    }));

    const { sql, values } = insertHelperBulk("calendar_items", rows);

    const [result] = await connection.query<ResultSetHeader>(sql, values);

    if (result.affectedRows > 0)
      return res.status(200).send({ code: NOTE_CAL_CODES.SAVE_SUCCESS });

    return res.status(200).send({ code: NOTE_CAL_CODES.SAVE_FAIL });
  } catch (err) {
    console.log(err);
    return res.status(200).send({ code: NOTE_CAL_CODES.SAVE_FAIL });
  }
}
