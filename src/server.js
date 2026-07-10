import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createInterviewController } from "./interface-adapters/interviewController.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(__dirname, "..", "dist");
const interviewController = createInterviewController();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

const server = createServer(async (request, response) => {
  try {
    if (request.url === "/api/initial-state" && request.method === "GET") {
      return sendJson(response, 200, interviewController.initialState());
    }

    if (request.url === "/api/me" && request.method === "GET") {
      try {
        const result = await interviewController.me(bearerToken(request));
        return sendJson(response, 200, result);
      } catch (error) {
        const status = /ログインが必要/.test(error.message) ? 401 : 502;
        return sendJson(response, status, { error: error.message });
      }
    }

    if (request.url === "/api/realtime-session" && request.method === "POST") {
      const body = await readJsonBody(request);
      try {
        const result = await interviewController.createInterviewSession(
          body,
          bearerToken(request)
        );
        return sendJson(response, 200, result);
      } catch (error) {
        const status = /アクセスコード|ログインが必要/.test(error.message)
          ? 401
          : /チケットが不足/.test(error.message)
            ? 402
            : /unknown challenge/.test(error.message)
              ? 400
              : 502;
        return sendJson(response, status, { error: error.message });
      }
    }

    if (request.url === "/api/evaluate-interview" && request.method === "POST") {
      const body = await readJsonBody(request);
      try {
        const result = await interviewController.evaluateInterview(
          body,
          bearerToken(request)
        );
        return sendJson(response, 200, result);
      } catch (error) {
        const status = /アクセスコード|ログインが必要/.test(error.message)
          ? 401
          : /unknown challenge|transcript is required/.test(error.message)
            ? 400
            : 502;
        return sendJson(response, status, { error: error.message });
      }
    }

    const urlPath = request.url === "/" ? "/index.html" : request.url;
    const safePath = urlPath.replace(/\.\./g, "");
    const absolutePath = join(distDir, safePath);

    try {
      const content = await readFile(absolutePath);
      response.writeHead(200, {
        "Content-Type": contentTypes[extname(absolutePath)] ?? "text/plain"
      });
      response.end(content);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      const indexPath = join(distDir, "index.html");
      const indexContent = await readFile(indexPath);
      response.writeHead(200, { "Content-Type": contentTypes[".html"] });
      response.end(indexContent);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(
        "dist/ が見つかりません。先に npm run build を実行するか、npm run dev を使ってください。"
      );
      return;
    }
    sendJson(response, 500, { error: error.message });
  }
});

const port = Number(process.env.PORT ?? 4173);
server.listen(port, () => {
  console.log(`システム設計模擬面接を http://localhost:${port} で起動しました`);
});

function bearerToken(request) {
  const header = request.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      rawBody += chunk;
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(rawBody || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}
