"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SDashboardButton, SDashboardNotice, SLoginBackdrop, SLoginCard } from "@dashboard/styles/dashboard.styles";

export default function DashboardLoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user) router.replace("/dashboard");
  }, [router, session?.user]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error(result.error.message || "Não foi possível entrar.");
      router.replace("/dashboard");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SLoginBackdrop>
      <SLoginCard aria-labelledby="dashboard-login-title">
        <h1 id="dashboard-login-title">Brasil Gravações</h1>
        <p>Acesse o painel administrativo com seu e-mail e senha.</p>
        {isPending && <SDashboardNotice role="status">Verificando sua sessão…</SDashboardNotice>}
        {error && <SDashboardNotice $error role="alert">{error}</SDashboardNotice>}
        <form onSubmit={signIn}>
          <label>
            E-mail
            <input autoComplete="username" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label>
            Senha
            <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          <SDashboardButton disabled={isSubmitting} type="submit">
            {isSubmitting ? "Entrando…" : "Entrar"}
          </SDashboardButton>
        </form>
      </SLoginCard>
    </SLoginBackdrop>
  );
}
