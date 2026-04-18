import bcrypt from "bcrypt";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";
import { getDBConnection, insertHelper } from "@/utils/database";
import { capitaliseFirstLetter } from "@/utils/misc/caps";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { email: hashedEmail, password: hashedPassword, username } = req.body;

  // check if params are there
  if (
    typeof hashedEmail !== "string" ||
    typeof hashedPassword !== "string" ||
    typeof username !== "string"
  ) {
    res
      .status(400)
      .json({ error: "Please input the email,  hashedPassword and username" });
    return;
  }

  // get db connection and check if user with the email exists
  const connection = await getDBConnection();

  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT email from users WHERE email = ?;",
    [hashedEmail],
  );

  // user exists if theres a row in the db
  const userExists = rows.length !== 0;

  if (userExists) {
    return res.status(409).send({
      message: "User with this email already exists.",
      code: USER_CODES.USER_EXISTS,
    });
  }

  const cryptPass = await bcrypt.hash(hashedPassword, 12);

  const userData = {
    username: capitaliseFirstLetter(username),
    email: hashedEmail,
    password: cryptPass,
  };

  const { sql, values } = insertHelper("users", userData);

  const [result] = await connection.query<ResultSetHeader>(sql, values);

  const success = result?.affectedRows === 1;

  if (success)
    return res.status(200).send({
      success: true,
      message: "Account created successfully.",
      code: USER_CODES.CREATED_SUCCESSFULLY,
    });

  res.status(200).json({ success: false, result });
}
