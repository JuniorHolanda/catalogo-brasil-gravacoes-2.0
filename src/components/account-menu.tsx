"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { FaGoogle, FaTimes, FaUser } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-client";
import { authErrorMessage, type AuthAvailability } from "@/lib/auth-feedback";
import type { AccountOrderStatus, AccountUser } from "@/lib/account";
import {
  SAccountAction,
  SAccountAvatar,
  SAccountClose,
  SAccountDismiss,
  SAccountIntro,
  SAccountHeading,
  SAccountIdentity,
  SAccountLoginButton,
  SAccountLogoutButton,
  SAccountNotice,
  SAccountOverlay,
  SAccountPanel,
  SAccountProfile,
  SAccountSectionHeading,
  SAccountTopline,
  SAuthDivider,
  SAuthField,
  SAuthForm,
  SAuthInput,
  SGuestDescription,
  SGuestHeading,
  SGoogleLoginButton,
  SOrderItem,
  SOrderList,
  SOrderNumber,
  SOrderStatus,
  SRegisterPrompt,
} from "@/styles/mobile-bottom-navigation.styles";

const MotionAccountOverlay = motion.create(SAccountOverlay);
const MotionAccountPanel = motion.create(SAccountPanel);

type AccountMenuProps = {
  user: AccountUser | null;
  onClose: () => void;
  initialAuthMode?: "signIn" | "signUp";
  standalone?: boolean;
};

const orderStatusLabels: Record<AccountOrderStatus, string> = {
  awaiting: "Aguardando",
  approved: "Aprovado",
  rejected: "Recusado",
  producing: "Produzindo",
  problem: "Problema",
  completed: "Concluído",
  cancelled: "Cancelado",
};

/** Mostra os atalhos da conta conforme a sessão autenticada disponível. */
export function AccountMenu({ user, onClose, initialAuthMode = "signIn", standalone = false }: AccountMenuProps) {
  const [authNotice, setAuthNotice] = useState("");
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">(initialAuthMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<AuthAvailability | null>(null);
  const [availabilityFailed, setAvailabilityFailed] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [recentOrders, setRecentOrders] = useState(user?.recentOrders ?? []);
  const panelRef = useRef<HTMLElement>(null);
  const visibleOrders = recentOrders.slice(0, 3);
  const userEmail = user?.email;
  const safeProfileImage = user?.profileImageUrl &&
    /^(https:\/\/|\/(?!\/))/i.test(user.profileImageUrl)
    ? user.profileImageUrl
    : undefined;

  useEffect(() => {
    panelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (userEmail) return;
    const controller = new AbortController();
    void apiFetch("/api/auth/config", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Auth configuration unavailable");
        return await response.json() as AuthAvailability;
      })
      .then((config) => {
        if (!controller.signal.aborted) setAvailability(config);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailabilityFailed(true);
      });
    return () => controller.abort();
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;

    let isCurrent = true;
    void apiFetch("/api/v1/orders/recent", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as { orders?: typeof recentOrders };
      })
      .then((result) => {
        if (isCurrent && result?.orders) setRecentOrders(result.orders);
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [userEmail]);

  async function signInWithGoogle() {
    if (isSubmitting || !availability?.google) return;
    setIsSubmitting(true);
    setAuthNotice("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.href,
      });
      if (result.error) {
        setAuthNotice("Não foi possível entrar com Google. Tente novamente em instantes.");
      }
    } catch {
      setAuthNotice("Não foi possível iniciar o acesso com Google.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (authMode === "signUp" && !availability?.emailSignUp) {
      setAuthNotice("O cadastro está temporariamente indisponível. Tente novamente mais tarde.");
      return;
    }
    setIsSubmitting(true);
    setAuthNotice("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    setVerificationEmail("");

    try {
      const result = authMode === "signUp"
        ? await authClient.signUp.email({ name, email, password, callbackURL: window.location.href })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setAuthNotice(result.error.code === "EMAIL_NOT_VERIFIED" && !availability?.verificationEmail
          ? "Seu e-mail ainda não foi confirmado. O envio de confirmação está temporariamente indisponível."
          : authErrorMessage(result.error));
        if (result.error.code === "EMAIL_NOT_VERIFIED") setVerificationEmail(email);
      } else {
        if (authMode === "signUp") setVerificationEmail(email);
        setAuthNotice(authMode === "signUp"
          ? "Enviamos um link de confirmação. Verifique seu e-mail para acessar a conta."
          : "Acesso realizado.");
      }
    } catch {
      setAuthNotice("Não foi possível conectar ao serviço de acesso. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendVerification() {
    if (isSubmitting || !verificationEmail || !availability?.verificationEmail) return;
    setIsSubmitting(true);
    setAuthNotice("");
    try {
      const result = await authClient.sendVerificationEmail({
        email: verificationEmail,
        callbackURL: window.location.href,
      });
      setAuthNotice(result.error
        ? authErrorMessage(result.error)
        : "Se a conta ainda precisar de confirmação, você receberá outro link. Confira também a pasta de spam.");
    } catch {
      setAuthNotice("Não foi possível reenviar a confirmação. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MotionAccountOverlay
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
    >
      <SAccountDismiss
        aria-label="Fechar menu da conta"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <MotionAccountPanel
        $guest={!user}
        $standalone={standalone}
        animate={{ opacity: 1, y: 0 }}
        aria-describedby={user ? (visibleOrders.length > 0 ? undefined : "account-menu-description") : "guest-login-description"}
        aria-modal="true"
        aria-labelledby={user ? "account-menu-title" : "guest-login-title"}
        id="account-menu"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 18 }}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {user ? (
          <>
            <SAccountTopline>
              <SAccountHeading id="account-menu-title">Minha conta</SAccountHeading>
              <SAccountClose aria-label="Fechar menu da conta" onClick={onClose} type="button">
                <FaTimes aria-hidden="true" />
              </SAccountClose>
            </SAccountTopline>

            <SAccountProfile>
              <SAccountAvatar aria-hidden="true">
                {safeProfileImage ? (
                  <Image src={safeProfileImage} alt="" width={56} height={56} unoptimized />
                ) : (
                  <FaUser />
                )}
              </SAccountAvatar>
              <SAccountIdentity>
                <strong>{user.name}</strong>
                <span>{user.companyName || user.email}</span>
              </SAccountIdentity>
            </SAccountProfile>

            <SAccountSectionHeading>Pedidos recentes</SAccountSectionHeading>
            {visibleOrders.length > 0 ? (
              <SOrderList>
                {visibleOrders.map((order) => (
                  <SOrderItem key={order.number}>
                    <SOrderNumber>{order.number}</SOrderNumber>
                    <SOrderStatus $status={order.status}>
                      {orderStatusLabels[order.status]}
                    </SOrderStatus>
                  </SOrderItem>
                ))}
              </SOrderList>
            ) : (
              <SAccountIntro id="account-menu-description">
                Seus pedidos aparecerão aqui quando houver algum em andamento.
              </SAccountIntro>
            )}

            <SAccountAction href="/painel">Ir para o painel</SAccountAction>
            <SAccountLogoutButton
              onClick={async () => {
                if (isSubmitting) return;
                setIsSubmitting(true);
                setAuthNotice("");
                try {
                  const result = await authClient.signOut();
                  if (result.error) setAuthNotice("Não foi possível sair da conta. Tente novamente.");
                  else onClose();
                } catch {
                  setAuthNotice("Não foi possível sair da conta. Tente novamente.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              type="button"
            >
              Sair da conta
            </SAccountLogoutButton>
            {authNotice && <SAccountNotice role="status">{authNotice}</SAccountNotice>}
          </>
        ) : (
          <>
            <SGuestHeading id="guest-login-title">
              {authMode === "signIn" ? "Entre para salvar seu orçamento" : "Crie sua conta"}
            </SGuestHeading>
            <SGuestDescription id="guest-login-description">
              Seu orçamento atual será mantido após o login.
            </SGuestDescription>

            {availability?.google && (
              <>
                <SGoogleLoginButton onClick={signInWithGoogle} disabled={isSubmitting} type="button">
                  <FaGoogle aria-hidden="true" />
                  Continuar com Google
                </SGoogleLoginButton>
                <SAuthDivider aria-hidden="true">OU</SAuthDivider>
              </>
            )}

            <SAuthForm onSubmit={submitCredentials}>
              {authMode === "signUp" && (
                <SAuthField>
                  <label htmlFor="account-name">Nome</label>
                  <SAuthInput
                    autoComplete="name"
                    id="account-name"
                    name="name"
                    maxLength={120}
                    disabled={isSubmitting}
                    placeholder="Digite seu nome"
                    required
                    type="text"
                  />
                </SAuthField>
              )}

              <SAuthField>
                <label htmlFor="account-email">Email</label>
                <SAuthInput
                  autoComplete="email"
                  id="account-email"
                  name="email"
                  maxLength={254}
                  disabled={isSubmitting}
                  placeholder="Digite seu e-mail"
                  required
                  type="email"
                />
              </SAuthField>

              <SAuthField>
                <label htmlFor="account-password">Senha</label>
                <SAuthInput
                  autoComplete={authMode === "signUp" ? "new-password" : "current-password"}
                  id="account-password"
                  minLength={authMode === "signUp" ? 8 : undefined}
                  name="password"
                  maxLength={128}
                  disabled={isSubmitting}
                  placeholder="Digite sua senha"
                  required
                  type="password"
                />
              </SAuthField>

              <SAccountLoginButton disabled={isSubmitting || (authMode === "signUp" && !availability?.emailSignUp)} type="submit">
                {isSubmitting ? "Aguarde..." : authMode === "signUp" ? "Cadastrar" : "Entrar"}
              </SAccountLoginButton>
            </SAuthForm>

            {authMode === "signUp" && availability && !availability.emailSignUp && (
              <SAccountNotice role="status">O cadastro está temporariamente indisponível. Tente novamente mais tarde.</SAccountNotice>
            )}
            {authMode === "signUp" && !availability && (
              <SAccountNotice role="status">
                {availabilityFailed ? "Não foi possível consultar o serviço de cadastro. Tente novamente em instantes." : "Verificando disponibilidade do cadastro…"}
              </SAccountNotice>
            )}
            <SRegisterPrompt>
              {authMode === "signIn" ? "Ainda não tem uma conta?" : "Já tem uma conta?"}
              <button
                onClick={() => {
                  setAuthMode((mode) => mode === "signIn" ? "signUp" : "signIn");
                  setAuthNotice("");
                  setVerificationEmail("");
                }}
                disabled={isSubmitting}
                type="button"
              >
                {authMode === "signIn" ? "Cadastre-se" : "Entrar"}
              </button>
            </SRegisterPrompt>

            {authNotice && <SAccountNotice role="status">{authNotice}</SAccountNotice>}
            {verificationEmail && availability?.verificationEmail && (
              <SRegisterPrompt>
                <button type="button" disabled={isSubmitting} onClick={resendVerification}>
                  Reenviar confirmação de e-mail
                </button>
              </SRegisterPrompt>
            )}
          </>
        )}
      </MotionAccountPanel>
    </MotionAccountOverlay>
  );
}
