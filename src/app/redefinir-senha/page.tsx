"use client";
import { font } from "@/styles/mixins";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-feedback";
import { cssTheme } from "@/styles/theme";
import { SAccountLoginButton, SAccountNotice, SAuthField, SAuthForm, SAuthInput } from "@/styles/mobile-bottom-navigation.styles";

const SResetShell = styled.main`
  display: grid;
  min-height: 100svh;
  place-items: center;
  padding: 2rem 1rem calc(6rem + env(safe-area-inset-bottom));
`;

const SResetCard = styled.section`
  display: grid;
  width: min(100%, 28rem);
  gap: 1rem;
  padding: clamp(1.5rem, 5vw, 2.5rem);
  border: 1px solid ${cssTheme.colors.border};
  border-radius: 1.25rem;
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surface};
  box-shadow: ${cssTheme.shadows.medium};
`;

const SResetBrand = styled.p`
  color: ${cssTheme.colors.primary};
  ${font("text-md")}
  font-weight: 800;
`;

const SResetHeading = styled.h1`
  ${font("title-md")}
  line-height: 1.2;
`;

const SResetDescription = styled.p`
  color: ${cssTheme.colors.textMuted};
  line-height: 1.5;
`;

const SResetLink = styled(Link)`
  color: ${cssTheme.colors.primary};
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 0.15em;
`;

type ResetPageState = "loading" | "ready" | "invalid" | "success";

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<ResetPageState>("loading");
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");
    if (params.has("error") || !resetToken) {
      setNotice("Este link expirou ou não é válido. Solicite uma nova redefinição de senha.");
      setPageState("invalid");
      return;
    }

    setToken(resetToken);
    setPageState("ready");
  }, []);

  async function submitNewPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !token) return;

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (newPassword !== confirmPassword) {
      setNotice("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");
    try {
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error?.code === "INVALID_TOKEN") {
        setNotice("Este link expirou ou já foi usado. Solicite uma nova redefinição de senha.");
        setPageState("invalid");
      } else if (result.error) {
        setNotice(authErrorMessage(result.error));
      } else {
        setNotice("Senha redefinida. Agora você pode entrar com a nova senha.");
        setPageState("success");
      }
    } catch {
      setNotice("Não foi possível redefinir sua senha. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SResetShell>
      <SResetCard aria-labelledby="reset-password-heading">
        <SResetBrand>Brasil Gravações</SResetBrand>
        <SResetHeading id="reset-password-heading">Redefina sua senha</SResetHeading>

        {pageState === "loading" && (
          <SResetDescription>Validando seu link...</SResetDescription>
        )}

        {pageState === "ready" && (
          <>
            <SResetDescription>Escolha uma senha nova com pelo menos 8 caracteres.</SResetDescription>
            <SAuthForm onSubmit={submitNewPassword}>
              <SAuthField>
                <label htmlFor="new-password">Nova senha</label>
                <SAuthInput
                  autoComplete="new-password"
                  autoFocus
                  id="new-password"
                  maxLength={128}
                  minLength={8}
                  name="newPassword"
                  placeholder="Digite a nova senha"
                  required
                  type="password"
                />
              </SAuthField>
              <SAuthField>
                <label htmlFor="confirm-password">Confirme a nova senha</label>
                <SAuthInput
                  autoComplete="new-password"
                  id="confirm-password"
                  maxLength={128}
                  minLength={8}
                  name="confirmPassword"
                  placeholder="Digite a senha novamente"
                  required
                  type="password"
                />
              </SAuthField>
              <SAccountLoginButton disabled={isSubmitting} type="submit">
                {isSubmitting ? "Salvando..." : "Salvar nova senha"}
              </SAccountLoginButton>
            </SAuthForm>
          </>
        )}

        {notice && <SAccountNotice role="status">{notice}</SAccountNotice>}
        {pageState === "invalid" && <SResetLink href="/">Voltar ao site</SResetLink>}
        {pageState === "success" && <SResetLink href="/">Voltar ao site para entrar</SResetLink>}
      </SResetCard>
    </SResetShell>
  );
}
