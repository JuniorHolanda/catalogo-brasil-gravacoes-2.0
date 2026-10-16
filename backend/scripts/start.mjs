import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const backendDirectory = resolve(scriptDirectory, "..");
const nextCli = resolve(backendDirectory, "..", "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextCli, "start", "--port", process.env.PORT || "4000"], {
  cwd: backendDirectory,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
