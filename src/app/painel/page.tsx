"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerFilesPanel } from "@/components/customer-files-panel";
import { authClient } from "@/lib/auth-client";
import { SPanelNotice } from "@/styles/customer-dashboard.styles";

export default function CustomerPanelPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/");
  }, [isPending, router, session?.user]);

  if (isPending || !session?.user) return <SPanelNotice role="status">Carregando sua conta…</SPanelNotice>;
  return <CustomerFilesPanel />;
}
