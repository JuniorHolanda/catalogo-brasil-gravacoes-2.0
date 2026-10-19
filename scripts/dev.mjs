import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const next = require.resolve("next/dist/bin/next");
const root = fileURLToPath(new URL("../", import.meta.url));
const backend = fileURLToPath(new URL("../backend/", import.meta.url));
const children = [];
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (!child.pid || child.exitCode !== null) continue;
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
    } else {
      process.kill(-child.pid, "SIGTERM");
    }
  }
}

for (const [name, cwd, port] of [["API", backend, "4000"], ["Frontend", root, "3000"]]) {
  const child = spawn(process.execPath, [next, "dev", "--port", port], {
    cwd,
    stdio: "inherit",
    detached: process.platform !== "win32",
    windowsHide: true,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(`${name}: ${error.message}`);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) {
      console.error(`${name} foi encerrado. Finalizando o ambiente local.`);
      stop(code ?? 1);
    }
  });
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
