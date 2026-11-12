import { createInterviewController } from "../src/interface-adapters/interviewController.js";

const interviewController = createInterviewController();

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }
  const result = await interviewController.health();
  response.setHeader("Cache-Control", "no-store");
  response.status(result.ok ? 200 : 503).json(result);
}
