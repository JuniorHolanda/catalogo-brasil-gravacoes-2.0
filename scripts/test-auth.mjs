import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import nextEnv from "@next/env";
import ts from "typescript";

// Exercises the actual auth handlers in a disposable Atlas database. Email
// delivery is captured in memory; no message is sent to an external recipient.
const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(join(root, "backend"), true);
assert.ok(process.env.MONGODB_URI, "Configure backend/.env.local antes do teste.");
const databaseName = `auth_${randomUUID().replaceAll("-", "")}`;
process.env.MONGODB_DB = databaseName;
process.env.NODE_ENV = "development";
process.env.BETTER_AUTH_URL = "http://localhost:4000";
process.env.FRONTEND_ORIGINS = "http://localhost:3000";
process.env.BETTER_AUTH_SECRET = randomBytes(32).toString("hex");
delete process.env.RESEND_API_KEY;
delete process.env.STORAGE_ALERT_FROM;
delete process.env.GOOGLE_CLIENT_ID;
delete process.env.GOOGLE_CLIENT_SECRET;

const cache = join(root, "node_modules/.cache/auth-tests");
await mkdir(cache, { recursive: true });
const compiledDirectory = await mkdtemp(join(cache, "run-"));
const modules = {
  "@/server/auth/auth-availability": "backend/src/server/auth/auth-availability.ts",
  "@/server/database/mongodb": "backend/src/server/database/mongodb.ts",
  "@/server/auth/auth": "backend/src/server/auth/auth.ts",
  "@/server/http/auth": "backend/src/server/http/auth.ts",
};
const moduleFiles = Object.fromEntries(Object.keys(modules).map((alias, i) => [alias, `module-${i}.mjs`]));
for (const [alias, sourcePath] of Object.entries(modules)) {
  let source = await readFile(join(root, sourcePath), "utf8");
  // server-only is a Next bundler marker; the handlers run in Node here.
  source = source.replace('import "server-only";', "");
  for (const [dependency, file] of Object.entries(moduleFiles)) {
    source = source.replaceAll(`"${dependency}"`, `"./${file}"`);
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  await writeFile(join(compiledDirectory, moduleFiles[alias]), outputText);
}

const { getMongoClient, getMongoDatabase } = await import(pathToFileURL(join(compiledDirectory, moduleFiles["@/server/database/mongodb"])));
const { GET, POST } = await import(pathToFileURL(join(compiledDirectory, moduleFiles["@/server/http/auth"])));
const db = getMongoDatabase();
const email = `auth-check-${randomUUID()}@example.invalid`;
const password = randomBytes(24).toString("base64url");
const callbackURL = "http://localhost:3000/servicos/tampografia";
const originalFetch = globalThis.fetch;
const deliveries = [];
globalThis.fetch = async (url, options) => {
  assert.equal(String(url), "https://api.resend.com/emails", "Destino de e-mail inesperado.");
  const message = JSON.parse(options.body);
  assert.deepEqual(message.to, [email]);
  deliveries.push(message);
  return Response.json({ id: randomUUID() });
};
function post(path, body, cookie, origin = "http://localhost:3000") {
  return POST(new Request(`http://localhost:4000/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  }));
}
function cookies(response) {
  return response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
}
function session(cookie) {
  return GET(new Request("http://localhost:4000/api/auth/get-session", { headers: { Cookie: cookie } }));
}
try {
  let response = await post("sign-up/email", { name: "Teste de autenticação", email, password, callbackURL });
  assert.equal(response.status, 503);
  assert.equal(await db.collection("users").countDocuments({}), 0);
  console.log("PASS: cadastro sem envio configurado não cria conta.");

  process.env.RESEND_API_KEY = "test-only-in-memory";
  process.env.STORAGE_ALERT_FROM = "auth@example.invalid";
  response = await post("sign-up/email", { name: "Teste de autenticação", email, password, callbackURL });
  assert.equal(response.status, 200, "Cadastro deve ser aceito com envio disponível.");
  assert.equal((await response.json()).token, null);
  assert.equal(await db.collection("users").countDocuments({ email, emailVerified: false }), 1);
  const account = await db.collection("account").findOne({ providerId: "credential" });
  assert.ok(account?.password && account.password !== password, "A senha precisa ser armazenada como hash.");
  assert.equal(deliveries.length, 1);
  console.log("PASS: cadastro persiste usuário não confirmado e senha protegida.");

  response = await post("sign-in/email", { email, password });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "EMAIL_NOT_VERIFIED");
  response = await post("send-verification-email", { email, callbackURL });
  assert.equal(response.status, 200);
  const verificationURL = deliveries.at(-1).text.match(/https?:\/\/\S+/)?.[0];
  assert.ok(verificationURL);
  assert.equal(new URL(verificationURL).searchParams.get("callbackURL"), callbackURL);
  response = await GET(new Request(verificationURL));
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), callbackURL);
  let cookie = cookies(response);
  assert.ok(cookie);
  assert.equal((await (await session(cookie)).json()).user.emailVerified, true);
  console.log("PASS: confirmação retorna ao orçamento e cria sessão autenticada.");

  response = await post("sign-in/email", { email, password: "senha-incorreta" });
  assert.equal(response.status, 401);
  response = await post("sign-in/email", { email, password }, undefined, "https://untrusted.example");
  assert.equal(response.status, 403);
  response = await post("sign-in/email", { email, password });
  assert.equal(response.status, 200);
  cookie = cookies(response);
  assert.equal((await (await session(cookie)).json()).user.email, email);
  console.log("PASS: senha incorreta e origem externa bloqueadas; login correto mantém sessão.");

  response = await post("sign-out", {}, cookie);
  assert.equal(response.status, 200);
  assert.equal(await (await session(cookie)).json(), null);
  console.log("PASS: logout invalida a sessão no servidor.");
  const resetRedirectTo = "http://localhost:3000/redefinir-senha";
  response = await post("request-password-reset", { email, redirectTo: resetRedirectTo });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, true);
  const resetURL = deliveries.at(-1).text.match(/https?:\/\/\S+/)?.[0];
  assert.ok(resetURL);
  assert.equal(new URL(resetURL).pathname.startsWith("/api/auth/reset-password/"), true);
  response = await GET(new Request(resetURL));
  assert.equal(response.status, 302);
  const resetCallback = new URL(response.headers.get("location"));
  assert.equal(`${resetCallback.origin}${resetCallback.pathname}`, resetRedirectTo);
  const resetToken = resetCallback.searchParams.get("token");
  assert.ok(resetToken);
  const newPassword = randomBytes(24).toString("base64url");
  response = await post("reset-password", { token: resetToken, newPassword });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, true);
  assert.equal((await post("sign-in/email", { email, password })).status, 401);
  response = await post("sign-in/email", { email, password: newPassword });
  assert.equal(response.status, 200);
  cookie = cookies(response);
  assert.equal((await (await session(cookie)).json()).user.email, email);
  console.log("PASS: password reset link consumes its token and invalidates the previous password.");
} finally {
  globalThis.fetch = originalFetch;
  assert.equal(db.databaseName, databaseName);
  assert.match(databaseName, /^auth_[a-f0-9]{32}$/);
  try {
    await db.dropDatabase();
  } finally {
    await getMongoClient().close();
    assert.ok(compiledDirectory.startsWith(cache + sep));
    await rm(compiledDirectory, { recursive: true, force: true });
  }
  console.log("Banco temporário de teste removido.");
}
