import bcrypt from "bcrypt";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";
import verifyUser, {
  createEncryptedCookie,
  hashEmailPass,
} from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const { email, username, password } = req.body;

  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });

  const connection = await getDBConnection();

  try {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (email) {
      const hashedEmail = hashEmailPass(email);

      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT email FROM users WHERE email = ? AND id != ?;",
        [hashedEmail, currentUser?.id],
      );
      if (rows.length !== 0) {
        return res.status(409).send({
          message: "User with this email already exists.",
          code: USER_CODES.USER_EXISTS,
        });
      }

      updates.push("email = ?");
      values.push(hashedEmail);
    }

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }

    if (password) {
      const hashedPassword = hashEmailPass(password);
      const cryptPass = await bcrypt.hash(hashedPassword, 12);
      updates.push("password = ?");
      values.push(cryptPass);
    }

    if (updates.length === 0) {
      return res.status(400).send({
        code: USER_CODES.INFO_NOT_ENTERED,
      });
    }

    values.push(currentUser?.id);

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?;`,
      values,
    );

    const success = result.affectedRows === 1;

    if (success) {
      const cookiePayload = {
        username: username,
        id: currentUser.id,
        email: email,
      };

      try {
        await createEncryptedCookie(res, "userInfo", cookiePayload);
      } catch (_) {
        return res.status(500).json({
          success: false,
          code: USER_CODES.SAVE_FAIL,
        });
      }

      return res.status(200).send({
        code: USER_CODES.SAVE_SUCCESS,
      });
    } else
      return res.status(200).send({
        code: USER_CODES.SAVE_FAIL,
      });
  } catch (err) {
    return res.status(200).send({
      code: USER_CODES.SAVE_FAIL,
    });
  }
}
