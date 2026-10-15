"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FaHome, FaTags, FaUser, FaWhatsapp } from "react-icons/fa";
import { AccountMenu } from "@/components/account-menu";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type { AccountUser } from "@/lib/account";
import { authClient } from "@/lib/auth-client";
import {
  SAccountControl,
  SBottomNavigation,
  SNavigationLink,
} from "@/styles/mobile-bottom-navigation.styles";

type MobileBottomNavigationProps = {
  /** Recebido pela sessão autenticada quando o fluxo de contas estiver conectado. */
  user?: AccountUser | null;
};

/** Exibe os atalhos globais e abre o menu de conta na navegação mobile. */
export function MobileBottomNavigation({ user = null }: MobileBottomNavigationProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const accountUser: AccountUser | null = session?.user
    ? {
        name: session.user.name || session.user.email,
        email: session.user.email,
        profileImageUrl: session.user.image || undefined,
        recentOrders: [],
      }
    : user;

  return (
    <>
      <SBottomNavigation aria-label="Navegação principal mobile">
        <SNavigationLink href="/" aria-label="Início" title="Início">
          <FaHome aria-hidden="true" />
        </SNavigationLink>

        <SNavigationLink
          href={createWhatsAppLink()}
          aria-label="Fale conosco pelo WhatsApp"
          title="WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaWhatsapp aria-hidden="true" />
        </SNavigationLink>

        <SNavigationLink href="/#servicos" aria-label="Ver serviços" title="Serviços">
          <FaTags aria-hidden="true" />
        </SNavigationLink>

        <SAccountControl
          aria-controls="account-menu"
          aria-expanded={accountMenuOpen}
          aria-label={accountMenuOpen ? "Fechar menu da conta" : "Abrir menu da conta"}
          onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
          title="Minha conta"
          type="button"
        >
          <FaUser aria-hidden="true" />
        </SAccountControl>
      </SBottomNavigation>

      <AnimatePresence initial={false}>
        {accountMenuOpen && (
          <AccountMenu key="account-menu" user={accountUser} onClose={() => setAccountMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
