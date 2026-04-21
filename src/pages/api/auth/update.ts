import { USER_CODES } from "@/types/user";
import verifyUser, { hashEmailPass } from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import bcrypt from "bcrypt";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
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
    const updates: string[] = [];
    const values: unknown[] = [];

    if (email) {
      const hashedEmail = hashEmailPass(email);

      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT email FROM users WHERE email = ? AND id != ?;",
        [hashedEmail, user?.id],
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

    values.push(user?.id);

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?;`,
      values,
    );

    const success = result.affectedRows === 1;

    if (success) {
      const cookiePayload = {
        username: username,
        id: user.id,
        email: email,
      };

      // sign the token with my jwt token
      const token = jwt.sign(cookiePayload, process.env.JWT_TOKEN!, {
        expiresIn: "30d",
      });

      // create 30 days cookie
      const cookie = serialize("userInfo", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      res.setHeader("Set-Cookie", cookie);

      return res.status(200).send({
        code: USER_CODES.SAVE_SUCCESS,
      });
    } else
      return res.status(200).send({
        code: USER_CODES.SAVE_FAIL,
      });
  } catch (err) {
    console.log(err);
    return res.status(200).send({
      code: USER_CODES.SAVE_FAIL,
    });
  }
}
