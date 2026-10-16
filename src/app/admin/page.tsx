import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/server/auth/auth";
import { getAdminDashboardData } from "@/server/admin/dashboard-service";
import { formatStorage } from "@/server/files/storage-quota";
import {
  SAdminAlert,
  SAdminDashboard,
  SAdminSection,
  SAdminStat,
  SAdminStats,
  SAdminStatus,
  SStorageProgress,
} from "@/styles/admin-dashboard.styles";

export const runtime = "nodejs";

export default async function AdminDashboardPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if ((session.user as typeof session.user & { role?: string }).role !== "admin") notFound();

  const { quota, fileCount, storageAlerts, usagePercent } = await getAdminDashboardData();

  return (
    <SAdminDashboard>
      <h1>Dashboard administrativa</h1>
      <p>Visão inicial do repositório de arquivos e dos avisos de capacidade.</p>

      <SAdminStats>
        <SAdminStat>
          <span>Armazenamento no R2</span>
          <strong>{formatStorage(quota.usedBytes)}</strong>
          <SStorageProgress aria-label={`${usagePercent.toFixed(1)}% do limite utilizado`} $percent={usagePercent} />
          <span>Limite de 9 GB · alerta a partir de 5 GB</span>
          <span>{formatStorage(quota.reservedBytes)} reservados para envios em andamento</span>
        </SAdminStat>
        <SAdminStat>
          <span>Arquivos disponíveis</span>
          <strong>{fileCount}</strong>
          <span>Metadados associados aos usuários no MongoDB Atlas</span>
        </SAdminStat>
      </SAdminStats>

      <SAdminSection aria-labelledby="storage-alerts-title">
        <h2 id="storage-alerts-title">Alertas de armazenamento</h2>
        {storageAlerts.length === 0 && <SAdminAlert>Nenhum alerta de capacidade até agora.</SAdminAlert>}
        {storageAlerts.map((alert) => (
          <SAdminAlert key={alert._id}>
            <div>
              <strong>{alert._id === "r2-9gb" ? "Limite de 9 GB atingido" : "Aviso de 5 GB"}</strong>
              <span>
                {formatStorage(alert.usedBytes)} · {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(alert.createdAt)}
              </span>
            </div>
            <SAdminStatus $pending={alert.status !== "sent"}>
              {alert.status === "sent"
                ? "E-mail enviado"
                : alert.status === "sending"
                  ? "E-mail em processamento"
                  : "E-mail pendente"}
            </SAdminStatus>
          </SAdminAlert>
        ))}
      </SAdminSection>
    </SAdminDashboard>
  );
}
