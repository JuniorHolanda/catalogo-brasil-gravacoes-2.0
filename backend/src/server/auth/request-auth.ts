import "server-only";
import { getAuth, migrateLegacyAuthUsers } from "@/server/auth/auth";
import { getMongoDatabase } from "@/server/database/mongodb";

export async function getRequestUser(request: Request) {
  await migrateLegacyAuthUsers();
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) return null;

  const configuredAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const isConfiguredAdmin = session.user.emailVerified
    && configuredAdmins.includes(session.user.email.toLowerCase());
  if (isConfiguredAdmin && (session.user as typeof session.user & { role?: string | null }).role !== "admin") {
    await getMongoDatabase().collection("users").updateOne(
      { email: session.user.email },
      { $set: { role: "admin", updatedAt: new Date() } },
    );
    return { ...session.user, role: "admin" };
  }

  return session.user;
}

export function isAdminUser(user: { role?: string | null } | null | undefined): boolean {
  return user?.role === "admin";
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const requestOrigin = new URL(origin).origin;
    const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:3000")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => new URL(item).origin);
    allowedOrigins.push(new URL(request.url).origin);
    return allowedOrigins.includes(requestOrigin);
  } catch {
    return false;
  }
}
