import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CustomerFilesPanel } from "@/components/customer-files-panel";
import { getAuth } from "@/server/auth/auth";

export const runtime = "nodejs";

export default async function CustomerPanelPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  return <CustomerFilesPanel />;
}
