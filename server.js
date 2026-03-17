import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3210);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const requestedPath = getRequestPath(request);
  if (!requestedPath) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  const normalizedPath = path.normalize(requestedPath);
  const relativePath = normalizedPath.replace(/^[/\\]+/, "");
  const filePath = path.resolve(__dirname, relativePath);

  if (
    !filePath.startsWith(`${__dirname}${path.sep}`) ||
    !existsSync(filePath) ||
    statSync(filePath).isDirectory()
  ) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] ?? "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Snake server running at http://localhost:${port}`);
});

function getRequestPath(request) {
  try {
    const parsedUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const pathname = parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}
