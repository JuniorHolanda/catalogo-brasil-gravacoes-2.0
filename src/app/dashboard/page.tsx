import type { Metadata } from "next";
import AdminDashboardPage from "../../../dashboard/src/app/dashboard/page";

export const metadata: Metadata = {
  title: "Dashboard | Brasil Gravações",
  robots: { index: false, follow: false, noarchive: true, googleBot: { index: false, follow: false, noarchive: true } },
};

export default function DashboardRoute() {
  return <AdminDashboardPage />;
}
