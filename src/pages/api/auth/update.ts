import { USER_CODES } from "@/types/user";
import verifyUser, { hashEmailPass } from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import bcrypt from "bcrypt";
import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const { email, username, password } = req.body;

  const rawCookie = req.headers.cookie;
  const user = await verifyUser(rawCookie as string);

  if (!user)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });

  const connection = await getDBConnection();

  try {
    const hashedEmail = hashEmailPass(email);
    const hashedPassword = hashEmailPass(password);
    const cryptPass = await bcrypt.hash(hashedPassword, 12);

    const [result] = await connection.query<ResultSetHeader>(
      "UPDATE users SET email = ?, username = ?, password = ?, WHERE id = ?",
      [hashedEmail, username, cryptPass],
    );

    const success = result.affectedRows === 1;

    if (success)
      return res.status(200).send({
        code: USER_CODES.SAVE_SUCCESS,
      });
    else
      return res.status(200).send({
        code: USER_CODES.SAVE_FAIL,
      });
  } catch (_) {
    return res.status(200).send({
      code: USER_CODES.SAVE_FAIL,
    });
  }
}
