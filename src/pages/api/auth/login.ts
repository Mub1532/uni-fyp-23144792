import bcrypt from "bcrypt";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES, type userInfo } from "@/types/user";
import { hashEmailPass } from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const { email: plainEmail, password: shaPassword } = req.body;

  if (typeof plainEmail !== "string" || typeof shaPassword !== "string") {
    res.status(400).json({
      // error: "Please input the email and password",
      code: USER_CODES.INFO_NOT_ENTERED,
    });
    return;
  }

  // hashed email
  const hashedEmail = hashEmailPass(plainEmail);

  const connection = await getDBConnection();

  // check if user with the email exists
  const [[userRow]] = await connection.query<RowDataPacket[]>(
    "SELECT username, password, id from users WHERE email = ?;",
    [hashedEmail],
  );

  if (!userRow)
    return res.status(401).send({
      // error: "User with this email does not exist.",
      code: USER_CODES.USER_DOESNT_EXIST,
    });

  const user = userRow as userInfo;

  // compare password with bcrypt
  const checkedPassword = await bcrypt.compare(shaPassword, user.password);

  if (!checkedPassword)
    return res.status(401).json({
      success: false,
      code: USER_CODES.WRONG_PASSWORD,
      // message: "Wrong password. Please try again.",
    });

  // create the cookie in the users browser, so they dont need to login each time
  const cookiePayload = {
    username: user.username,
    id: user.id,
    email: plainEmail,
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

  return res.status(200).json({
    success: true,
    code: USER_CODES.LOGGED_IN,
    // message: "User logged in successfully.",
  });
}
