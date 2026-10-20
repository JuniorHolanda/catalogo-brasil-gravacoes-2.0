import nextEnv from "@next/env";
import { admin } from "better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const uri = process.env.MONGODB_URI;
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri.trim())) {
  throw new Error("MONGODB_URI precisa começar com mongodb:// ou mongodb+srv://.");
}
if (!password || password.length < 8 || password.length > 128) {
  throw new Error("Defina ADMIN_BOOTSTRAP_PASSWORD com uma senha entre 8 e 128 caracteres.");
}
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET não está configurada.");
}

const admins = [
  { email: "contato@brasilgravacoes.com.br", name: "Contato Brasil Gravações" },
  { email: "vendas@brasilgravacoes.com.br", name: "Vendas Brasil Gravações" },
];
const client = new MongoClient(uri.trim(), { serverSelectionTimeoutMS: 8000 });

try {
  await client.connect();
  const database = client.db(process.env.MONGODB_DB || "brasil-gravacoes");
  const auth = betterAuth({
    appName: "Brasil Gravações",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(database, { client }),
    emailAndPassword: { enabled: true },
    user: {
      modelName: "users",
      additionalFields: { companyName: { type: "string", required: false, input: true } },
    },
    plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] })],
  });
  const context = await auth.$context;
  const usersCollection = database.collection("users");

  const hasLegacyUsers = await database.listCollections({ name: "user" }, { nameOnly: true }).hasNext();
  if (hasLegacyUsers) {
    await database.collection("user").aggregate([
      { $merge: { into: "users", on: "_id", whenMatched: "keepExisting", whenNotMatched: "insert" } },
    ]).toArray();
  }

  for (const profile of admins) {
    const email = profile.email.toLowerCase();
    const existing = await usersCollection.findOne({ email });
    const user = existing
      ? await context.internalAdapter.updateUser(String(existing._id), {
          name: profile.name,
          emailVerified: true,
          role: "admin",
        })
      : await context.internalAdapter.createUser({
          email,
          name: profile.name,
          emailVerified: true,
          role: "admin",
        }, { method: "admin" });

    const passwordHash = await context.password.hash(password);
    if (await context.internalAdapter.findCredentialAccount(user.id)) {
      await context.internalAdapter.updatePassword(user.id, passwordHash);
    } else {
      await context.internalAdapter.createAccount({
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: passwordHash,
      });
    }
    await context.internalAdapter.deleteUserSessions(user.id);
    console.log(`${existing ? "Atualizado" : "Criado"}: ${email}`);
  }
} finally {
  await client.close();
}
