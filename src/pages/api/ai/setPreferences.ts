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
    return res.status(401).send({ code: USER_CODES.NOT_LOGGED_IN });

  const { workDays, minStartTime, maxEndTime, maxDailyHours } = req.body;

  const connection = await getDBConnection();

  try {
    await connection.query(
      `INSERT INTO user_preferences (user_id, work_days, min_start_time, max_end_time, max_daily_hours)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         work_days = VALUES(work_days),
         min_start_time = VALUES(min_start_time),
         max_end_time = VALUES(max_end_time),
         max_daily_hours = VALUES(max_daily_hours)`,
      [
        currentUser.id,
        workDays.join(","),
        minStartTime,
        maxEndTime,
        maxDailyHours,
      ],
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ code: NOTE_CAL_CODES.SAVE_FAIL });
  }
}
