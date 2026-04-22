import { createGameController } from "../src/interface-adapters/gameController.js";

const gameController = createGameController();

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }
  response.status(200).json(gameController.initialState());
}
