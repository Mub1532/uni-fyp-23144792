import type { NextApiRequest, NextApiResponse } from "next";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";

const texts = [
  `Interim Project Report
• Problem Definition: Briefly introduce the topic and establish the context.
Explain why the area is important and provide a strong hook to engage the
reader.
• Review: This is a crucial part of the proposal. You should review existing
academic or professional knowledge, theories, and studies relevant to your topic.
The aim is not merely to summarise but to critically analyse to identify a "gap"
or scope and to substantiate the project idea or the problem that needs solving,
or a new perspective to explore. This section offers the justification for your
project.
• Aims, Objectives and Scope: Based on the identified gap, clearly state your
project's overall aim. Then, break it down into 4-5 SMART (Specific,
Measurable, Achievable, Relevant, Time-bound) objectives. These are the
tangible steps you will take to achieve your aim.
• Design, Methods & Timeline: Describe the "how" of your project. Explain the
methods you will use to design, develop, validate, and evaluate your appraisal.
These methods will differ depending on the type of project you are undertaking,
such as experiments, surveys, interviews, case study analysis, or software
development. Justify why these methods are the most suitable for your project
and how they address the objectives. Provide a realistic timeline for the entire
project, using a Gantt chart.
• Feasibility, Risks & Ethical Aspects: The idea is to demonstrate the project’s
practicality and responsibility. So, you need to address whether your project is
realistic and achievable within the given timeframe and resources. Identify
potential risks (e.g., "access to data is delayed," "key software has a steep
learning curve") and suggest practical ways to mitigate them. Also, discuss how
you will deal with the ethical implications of your project, particularly
concerning data, privacy, and social impact.`,
  `Website Development with Next.js:
research existing websites and critically analyse them say what my website would fix which problem it would fix create time plan for this things design website ui ux first and then develop in next js also like idk mysql db aswell develop that`,
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser)
    return res.status(401).send({
      code: USER_CODES.NOT_LOGGED_IN,
    });
  //   const { text } = req.body;

  //   if (!text) return res.status(400).send({ error: "text is required" });
  const text = texts[Math.floor(Math.random() * texts.length)];
  const response = await fetch(`${process.env.AI_HOST}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) return res.status(500).send({ error: "AI service error" });

  const data = await response.json();

  return res.status(200).send(data);
}
