import { createGameController } from "../src/interface-adapters/gameController.js";

const gameController = createGameController();

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    response.status(200).json(gameController.submitDesign(request.body ?? {}));
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}
