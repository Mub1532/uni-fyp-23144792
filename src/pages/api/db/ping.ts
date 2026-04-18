import type { NextApiRequest, NextApiResponse } from "next";
import { getDBConnection } from "@/utils/database";

// To test connection to database, just a ping command

type Response = {
  success: boolean;
  message?: string;
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    const connection = await getDBConnection();

    const ping = await connection.ping();

    connection.end();

    res.status(200).json({ success: ping as unknown as boolean });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err?.message as string });
  }

  res
    .status(200)
    .json({ success: false, message: "Failed to connect to database" });
}
