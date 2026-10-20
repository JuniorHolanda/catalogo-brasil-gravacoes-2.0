"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-client";
import {
  SDashboardButton,
  SDashboardCard,
  SDashboardHeader,
  SDashboardNotice,
  SDashboardPage,
  SDashboardProgress,
  SDashboardSection,
  SDashboardStat,
  SDashboardStats,
  SDashboardBrand,
} from "@dashboard/styles/dashboard.styles";

type QuoteRow = {
  id: string;
  number: string;
  customerName: string;
  accountEmail: string;
  serviceName: string;
  product: string;
  quantity: number;
  pricing?: { status?: string; totalCents?: number };
  status: "awaiting" | "approved" | "rejected" | "producing" | "problem";
  createdAt: string;
  fileCount: number;
};

type DashboardData = {
  storageStatus: "ready" | "missing-config" | "unavailable";
  quota: { usedBytes: number; reservedBytes: number } | null;
  fileCount: number;
  usagePercent: number;
  customerCount: number;
  quoteCount: number;
  quotes: QuoteRow[];
  storageAlerts: Array<{
    _id: "r2-5gb" | "r2-9gb";
    usedBytes: number;
    status: "pending" | "sending" | "sent";
    createdAt: string;
  }>;
};

function formatStorage(bytes: number) {
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function formatQuoteStatus(status: QuoteRow["status"]) {
  return status === "awaiting" ? "Aguardando" : status === "approved" ? "Aprovado" : status === "rejected" ? "Recusado" : status === "producing" ? "Em produção" : "Precisa de atenção";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [data, setData] = useState<DashboardData | null>(null);
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
        const result = await response.json().catch(() => ({})) as DashboardData & { error?: string };
        if (!response.ok) throw new Error(result.error || "Não foi possível carregar a dashboard.");
        if (current) setData(result);
      })
      .catch((reason: unknown) => {
        if (current) setError(reason instanceof Error ? reason.message : "Não foi possível carregar a dashboard.");
      });
    return () => { current = false; };
  }, [isPending, router, session?.user]);

  async function signOut() {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <SDashboardPage>
      <SDashboardHeader>
        <SDashboardBrand>
          <span aria-hidden="true">BG</span>
          <div><strong>Brasil Gravações</strong><small>Painel administrativo</small></div>
        </SDashboardBrand>
        <SDashboardButton onClick={() => void signOut()} type="button">Sair</SDashboardButton>
      </SDashboardHeader>
      <h1>Visão geral</h1>
      <p>Orçamentos, clientes, arquivos enviados e capacidade do armazenamento.</p>

      {!data && <SDashboardNotice $error={Boolean(error)} role="status">{error || (isPending ? "Verificando sua sessão…" : "Carregando dados…")}</SDashboardNotice>}
      {data && (
        <>
          <SDashboardStats>
            <SDashboardStat><span>Clientes cadastrados</span><strong>{data.customerCount}</strong></SDashboardStat>
            <SDashboardStat><span>Orçamentos recebidos</span><strong>{data.quoteCount}</strong></SDashboardStat>
            <SDashboardStat><span>Arquivos disponíveis</span><strong>{data.fileCount}</strong><span>Metadados no Atlas; conteúdo binário no R2</span></SDashboardStat>
            <SDashboardStat>
              <span>Armazenamento R2</span>
              {data.quota && <strong>{formatStorage(data.quota.usedBytes)}</strong>}
              {data.storageStatus === "ready" && data.quota && <SDashboardProgress aria-label={`${data.usagePercent.toFixed(1)}% do limite utilizado`} $percent={data.usagePercent} />}
              {data.storageStatus === "ready" && data.quota && <span>Limite de 9 GB · {formatStorage(data.quota.reservedBytes)} reservados</span>}
              {data.storageStatus === "missing-config" && <SDashboardNotice $error>Credenciais do R2 ausentes no ambiente da API.</SDashboardNotice>}
              {data.storageStatus === "unavailable" && <SDashboardNotice $error>O R2 não respondeu. Confira as credenciais e permissões do bucket.</SDashboardNotice>}
            </SDashboardStat>
          </SDashboardStats>

          <SDashboardSection aria-labelledby="quotes-title">
            <h2 id="quotes-title">Orçamentos recentes</h2>
            {data.quotes.length === 0 && <SDashboardNotice>Nenhum orçamento recebido ainda.</SDashboardNotice>}
            {data.quotes.map((quote) => (
              <SDashboardCard key={quote.id}>
                <header><strong>{quote.number} · {quote.customerName}</strong><span>{formatDate(quote.createdAt)}</span></header>
                <span>{quote.accountEmail || "Conta de cliente"}</span>
                <p>{quote.serviceName} · {quote.product} · {quote.quantity} unidade(s)</p>
                <span>
                  {formatQuoteStatus(quote.status)} · {quote.fileCount} arte(s) anexada(s)
                  {quote.pricing?.status === "calculated" && typeof quote.pricing.totalCents === "number"
                    ? ` · ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(quote.pricing.totalCents / 100)}`
                    : ""}
                </span>
              </SDashboardCard>
            ))}
          </SDashboardSection>

          <SDashboardSection aria-labelledby="storage-alerts-title">
            <h2 id="storage-alerts-title">Alertas de armazenamento</h2>
            {data.storageAlerts.length === 0 && <SDashboardNotice>Nenhum alerta de capacidade até agora.</SDashboardNotice>}
            {data.storageAlerts.map((alert) => (
              <SDashboardCard key={alert._id}>
                <header><strong>{alert._id === "r2-9gb" ? "Limite de 9 GB" : "Aviso de 5 GB"}</strong><span>{formatDate(alert.createdAt)}</span></header>
                <span>{formatStorage(alert.usedBytes)} · {alert.status === "sent" ? "E-mail enviado" : alert.status === "sending" ? "E-mail em processamento" : "E-mail pendente"}</span>
              </SDashboardCard>
            ))}
          </SDashboardSection>
        </>
      )}
    </SDashboardPage>
  );
}
