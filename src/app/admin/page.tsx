import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminRedirectPage() {
  const dashboardURL = process.env.NEXT_PUBLIC_DASHBOARD_URL
    || (process.env.NODE_ENV === "development" ? "http://localhost:3100" : "");
  if (!dashboardURL) {
    return <main>Configure NEXT_PUBLIC_DASHBOARD_URL para abrir o painel administrativo.</main>;
  }

  const destination = new URL(dashboardURL);
  if (!["http:", "https:"].includes(destination.protocol) || destination.username || destination.password) {
    throw new Error("NEXT_PUBLIC_DASHBOARD_URL precisa ser uma origem HTTP(S) válida.");
  }
  redirect(destination.origin);
}
