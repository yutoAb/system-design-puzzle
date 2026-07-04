import { createInterviewController } from "../src/interface-adapters/interviewController.js";

const interviewController = createInterviewController();

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    response.status(200).json(interviewController.submitDesign(request.body ?? {}));
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}
