"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-client";
import {
  SAdminAlert,
  SAdminDashboard,
  SAdminSection,
  SAdminStat,
  SAdminStats,
  SAdminStatus,
  SStorageProgress,
} from "@/styles/admin-dashboard.styles";

type AdminDashboardData = {
  quota: { usedBytes: number; reservedBytes: number };
  fileCount: number;
  storageAlerts: Array<{
    _id: "r2-5gb" | "r2-9gb";
    usedBytes: number;
    status: "pending" | "sending" | "sent";
    createdAt: string;
  }>;
  usagePercent: number;
};

function formatStorage(bytes: number) {
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/");
      return;
    }
    let current = true;
    void apiFetch("/api/v1/admin/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({})) as AdminDashboardData & { error?: string };
        if (!response.ok) throw new Error(result.error || "Não foi possível carregar a dashboard.");
        if (current) setData(result);
      })
      .catch((reason: unknown) => {
        if (current) setError(reason instanceof Error ? reason.message : "Não foi possível carregar a dashboard.");
      });
    return () => { current = false; };
  }, [isPending, router, session?.user]);

  return (
    <SAdminDashboard>
      <h1>Dashboard administrativa</h1>
      <p>Visão inicial do repositório de arquivos e dos avisos de capacidade.</p>

      {!data && <SAdminAlert role="status">{error || "Carregando dados da administração…"}</SAdminAlert>}
      {data && (
        <>
          <SAdminStats>
            <SAdminStat>
              <span>Armazenamento no R2</span>
              <strong>{formatStorage(data.quota.usedBytes)}</strong>
              <SStorageProgress aria-label={`${data.usagePercent.toFixed(1)}% do limite utilizado`} $percent={data.usagePercent} />
              <span>Limite de 9 GB · alerta a partir de 5 GB</span>
              <span>{formatStorage(data.quota.reservedBytes)} reservados para envios em andamento</span>
            </SAdminStat>
            <SAdminStat>
              <span>Arquivos disponíveis</span>
              <strong>{data.fileCount}</strong>
              <span>Metadados associados aos usuários no MongoDB Atlas</span>
            </SAdminStat>
          </SAdminStats>

          <SAdminSection aria-labelledby="storage-alerts-title">
            <h2 id="storage-alerts-title">Alertas de armazenamento</h2>
            {data.storageAlerts.length === 0 && <SAdminAlert>Nenhum alerta de capacidade até agora.</SAdminAlert>}
            {data.storageAlerts.map((alert) => (
              <SAdminAlert key={alert._id}>
                <div>
                  <strong>{alert._id === "r2-9gb" ? "Limite de 9 GB atingido" : "Aviso de 5 GB"}</strong>
                  <span>
                    {formatStorage(alert.usedBytes)} · {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(alert.createdAt))}
                  </span>
                </div>
                <SAdminStatus $pending={alert.status !== "sent"}>
                  {alert.status === "sent" ? "E-mail enviado" : alert.status === "sending" ? "E-mail em processamento" : "E-mail pendente"}
                </SAdminStatus>
              </SAdminAlert>
            ))}
          </SAdminSection>
        </>
      )}
    </SAdminDashboard>
  );
}
