import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getCustomerFilesCollection, getStorageAlertsCollection } from "@/lib/mongodb";
import { formatStorage, getStorageQuota, notifyStorageQuotaChanged, STORAGE_HARD_LIMIT_BYTES } from "@/lib/storage-quota";
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

  await notifyStorageQuotaChanged().catch(() => undefined);
  const [quota, files, alerts] = await Promise.all([
    getStorageQuota(),
    getCustomerFilesCollection(),
    getStorageAlertsCollection(),
  ]);
  const [fileCount, storageAlerts] = await Promise.all([
    files.countDocuments({ status: "ready" }),
    alerts.find().sort({ createdAt: -1 }).toArray(),
  ]);
  const usagePercent = Math.min(100, quota.usedBytes / STORAGE_HARD_LIMIT_BYTES * 100);

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
