import { createInterviewController } from "../src/interface-adapters/interviewController.js";

const interviewController = createInterviewController();

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const result = await interviewController.createInterviewSession(
      request.body ?? {}
    );
    response.status(200).json(result);
  } catch (error) {
    if (/unknown challenge/.test(error.message)) {
      response.status(400).json({ error: error.message });
      return;
    }
    response.status(502).json({ error: error.message });
  }
}
