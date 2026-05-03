import type { RowDataPacket } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { NOTE_CAL_CODES } from "@/types/notes";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });

  const connection = await getDBConnection();

  try {
    const [[result]] = await connection.query<RowDataPacket[]>(
      `SELECT task.*, JSON_ARRAYAGG(JSON_OBJECT('id', s.id, 'description', s.description, 'comments', s.comments, 'estimated_hours', s.estimated_hours)) AS subtasks FROM user_tasks task LEFT JOIN user_subtasks s ON s.task_id = task.id WHERE task.user_id = ? GROUP BY task.id`,
      [currentUser?.id],
    );

    return res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(200).send({
      code: NOTE_CAL_CODES.SAVE_FAIL,
    });
  }
}
