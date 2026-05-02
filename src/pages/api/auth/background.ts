import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const { imageUrl } = req.body;

  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });

  const connection = await getDBConnection();

  const response = await fetch(imageUrl);
  const contentType = response.headers.get("content-type");
  const isValidImage = contentType?.startsWith("image/") ?? false;

  if (!isValidImage)
    return res.status(200).send({
      code: USER_CODES.NOT_VALID_IMG,
    });

  try {
    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE users SET background_image = ? WHERE id = ?;`,
      [imageUrl, currentUser?.id],
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
