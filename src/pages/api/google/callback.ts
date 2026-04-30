import { google } from "googleapis";
import type { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code } = req.query;
  const rawCookie = req.headers.cookie;

  if (!rawCookie) return res.status(401).json({ loggedIn: false });

  const payload = await verifyUser(rawCookie);

  if (!payload) return res.status(401).json({ loggedIn: false });

  const { tokens } = await oauth2Client.getToken(code as string);
  const grantedScopes = tokens.scope?.split(" ") ?? [];
  const calendarGranted = grantedScopes.includes(
    "https://www.googleapis.com/auth/calendar.events.readonly",
  );

  if (!calendarGranted)
    return res.redirect(`/settings?code=${USER_CODES.GOOGLE_INFO_NOT_GRANTED}`);

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  const connection = await getDBConnection();

  const [result] = await connection.query<ResultSetHeader>(
    "UPDATE users SET google_access_token = ?, google_refresh_token = ?, google_name = ?, google_pic = ? WHERE id = ?",
    [
      tokens.access_token,
      tokens.refresh_token,
      data.name,
      data.picture,
      payload.id,
    ],
  );

  if (result.affectedRows !== 1)
    return res.redirect(`/settings?code=${USER_CODES.SAVE_FAIL}`);

  return res.redirect(`/settings?code=${USER_CODES.SAVE_SUCCESS}`);
}
