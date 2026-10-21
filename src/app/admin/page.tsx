import type { Metadata } from "next";
import DashboardLoginPage from "../../../dashboard/src/app/page";

export const metadata: Metadata = {
  title: "Acesso administrativo | Brasil Gravações",
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLoginRoute() {
  return <DashboardLoginPage />;
}
