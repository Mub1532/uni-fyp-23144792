import { google } from "googleapis";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser, { verifyGoogleAuth } from "@/utils/auth/jwt";
import { getDBConnection, insertHelperBulk } from "@/utils/database";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const rawCookie = req.headers.cookie;
  const { isManual } = req.query;

  if (!rawCookie) return res.status(401).json({ loggedIn: false });

  const payloadUser = await verifyUser(rawCookie);
  const payloadGoogle = await verifyGoogleAuth(payloadUser?.id);

  if (!payloadGoogle || !payloadUser)
    return res.status(401).json({ loggedIn: false });

  oauth2Client.setCredentials({
    access_token: payloadGoogle.googleAccessToken,
    refresh_token: payloadGoogle.googleRefreshToken,
  });

  const connection = await getDBConnection();

  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT google_last_synced FROM users WHERE id = ?",
    [payloadUser.id],
  );

  const lastSynced = rows[0]?.google_last_synced;

  const shouldSync =
    !lastSynced ||
    Date.now() - new Date(lastSynced).getTime() > 24 * 60 * 60 * 1000;

  if (!shouldSync && isManual !== "true")
    return res.status(200).send({
      success: true,
      message: "Not Synced, since its not been 24 hrs.",
      updatedAmount: 0,
    });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const { data } = await calendar.events.list({
    calendarId: "primary",
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  const formattedEvents = data.items?.map((x) => ({
    user_id: payloadUser?.id,
    title: "Google: " + (x.summary ?? "No Title"),
    description: x?.description?.startsWith(
      "Changes made to the title, description, or attachments will not be saved. To make edits, please go to:",
    )
      ? null
      : x?.description,
    start_time: new Date(x?.start?.dateTime ?? x?.start?.date ?? ""),
    end_time: new Date(x?.end?.dateTime ?? x?.end?.date ?? ""),
    type: "IMPORTED",
    imported_type: "Google",
    external_ical_id: x?.iCalUID ?? null,
  }));

  if (!formattedEvents) return res.status(500).json({ success: false });

  const { sql, values } = insertHelperBulk(
    "calendar_items",
    formattedEvents,
    undefined,
    true,
  );

  const [result] = await connection.query<ResultSetHeader>(sql, values);

  const amountUpdated = result.affectedRows;

  const [userResult] = await connection.query<ResultSetHeader>(
    "UPDATE users SET google_last_synced = ? WHERE id = ?;",
    [new Date(), payloadUser.id],
  );

  const success = userResult.affectedRows === 1;

  if (success)
    return res.status(200).json({
      success: true,
      updatedAmount: amountUpdated,
    });

  return res.status(500).json({ success: false });
}
