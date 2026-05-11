import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser)
    return res.status(401).send({ code: USER_CODES.NOT_LOGGED_IN });

  const { title, description } = req.body;

  if (!title || !description)
    return res.status(400).send({ code: USER_CODES.INFO_NOT_ENTERED });

  const input = `${title}: ${description}`;

  const response = await fetch(`${process.env.AI_HOST}/api/ai/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) return res.status(500).send({ error: "AI error" });

  const data = await response.json();

  return res.status(200).send({
    success: true,
    results: { ...data },
  });
}
