import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import test from "node:test";

async function getAvailablePort() {
  const socket = createServer();
  socket.listen(0);
  await once(socket, "listening");
  const address = socket.address();
  socket.close();

  if (!address || typeof address === "string") {
    throw new Error("Failed to allocate test port.");
  }

  return address.port;
}

async function startServerProcess(t) {
  const port = await getAvailablePort();
  const child = spawn(process.execPath, ["server.js"], {
    env: {
      ...process.env,
      PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  const stdoutChunks = [];
  const stderrChunks = [];
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");

  child.stdout.on("data", (chunk) => {
    stdoutChunks.push(chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderrChunks.push(chunk);
  });

  await Promise.race([
    once(child.stdout, "data"),
    once(child, "exit").then(([code]) => {
      throw new Error(`Server exited early with code ${code}. ${stderrChunks.join("")}`);
    })
  ]);

  t.after(() => {
    child.kill("SIGTERM");
  });

  return { port, stdoutChunks, stderrChunks };
}

test("serves assets for URLs with query strings", async (t) => {
  const { port } = await startServerProcess(t);

  const response = await fetch(`http://127.0.0.1:${port}/index.html?cache-bust=1`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html/i);
  assert.match(body, /<canvas[\s\S]*id="board"/);
});
