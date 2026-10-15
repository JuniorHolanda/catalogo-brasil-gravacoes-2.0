import { cssTheme } from "@/styles/theme";
import Link from "next/link";
import styled from "styled-components";
import type { AccountOrderStatus } from "@/lib/account";
import { padding, radius, transition } from "@/styles/mixins";

export const SBottomNavigation = styled.nav`
  ${padding('t-sm-2', 'b-sm-2', 'l-sm-2', 'r-sm-2', { safeArea: ["left", "right", "bottom"] })}
  ${radius("t-md")}
  position: fixed;
  z-index: 1000;
  right: 0;
  bottom: 0;
  left: 0;
  display: none;
  min-height: 4rem;
  align-items: center;
  justify-content: space-around;
  gap: var(--gap-sm-2);
  color: ${cssTheme.colors.accentText};
  background: ${cssTheme.colors.accent};
  box-shadow: ${cssTheme.shadows.navigation};

  @media (max-width: 760px) {
    display: flex;
  }

  > a,
  > button {
    flex: 1;
  }
`;

export const SNavigationLink = styled(Link)`
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  justify-self: center;
  ${radius("pill")}
  ${transition()}
  color: inherit;

  svg {
    width: 1.35rem;
    height: 1.35rem;
  }

  &:hover,
  &:active {
    color: ${cssTheme.palette.navy};
    background: color-mix(in srgb, ${cssTheme.colors.primary} 12%, transparent);
  }

  &:focus-visible {
    outline: 3px solid ${cssTheme.palette.navy};
    outline-offset: 2px;
  }
`;

export const SAccountControl = styled.button`
  display: grid;
  flex: 1;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  justify-self: center;
  padding: 0;
  border: 0;
  ${radius("pill")}
  ${transition()}
  color: inherit;
  background: transparent;
  cursor: pointer;

  svg {
    width: 1.35rem;
    height: 1.35rem;
  }

  &:hover,
  &:active,
  &[aria-expanded="true"] {
    color: ${cssTheme.palette.navy};
    background: color-mix(in srgb, ${cssTheme.colors.primary} 12%, transparent);
  }

  &:focus-visible {
    outline: 3px solid ${cssTheme.palette.navy};
    outline-offset: 2px;
  }
`;

export const SAccountOverlay = styled.div`
  position: fixed;
  z-index: 999;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: calc(4rem + env(safe-area-inset-bottom));
  background: color-mix(in srgb, ${cssTheme.palette.black} 38%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
`;

export const SAccountDismiss = styled.button`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: default;
`;

export const SAccountPanel = styled.section<{ $guest?: boolean }>`
  position: relative;
  z-index: 1;
  width: min(100%, 34rem);
  max-height: calc(100dvh - 7rem - env(safe-area-inset-bottom));
  overflow-y: auto;
  ${({ $guest }) => padding($guest ? "sm-3" : "md-2")}
  ${radius("t-lg")}
  color: ${cssTheme.colors.text};
  background: ${({ $guest }) =>
    $guest ? cssTheme.colors.surfacePanel : cssTheme.colors.background};
  box-shadow: ${cssTheme.shadows.high};
  overscroll-behavior: contain;

  ${({ $guest }) => $guest && `
    display: grid;
    gap: var(--gap-sm-2);
  `}

  @media (min-width: 761px) {
    display: none;
  }
`;

export const SAccountTopline = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap-md-2);
`;

export const SAccountHeading = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
`;

export const SAccountClose = styled.button`
  display: grid;
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 0;
  ${radius("pill")}
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surfaceMuted};
  cursor: pointer;

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const SAccountProfile = styled.div`
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  align-items: center;
  gap: var(--gap-md-2);
  ${padding('tb-md-2')}
  border-bottom: 1px solid ${cssTheme.colors.border};
`;

export const SAccountAvatar = styled.div`
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  overflow: hidden;
  ${radius("pill")}
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.border};

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const SAccountIdentity = styled.div`
  display: grid;
  gap: 0.1rem;

  strong {
    font-size: 1rem;
  }

  span {
    color: ${cssTheme.colors.textMuted};
    font-size: 0.85rem;
  }
`;

export const SAccountIntro = styled.p`
  max-width: 25rem;
  margin: var(--space-sm-2) 0 var(--space-md-2);
  color: ${cssTheme.colors.textMuted};
  line-height: 1.45;
`;

export const SGuestHeading = styled.h2`
  color: ${cssTheme.colors.text};
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.25;
`;

export const SGuestDescription = styled.p`
  color: ${cssTheme.colors.textMuted};
  font-size: 0.78rem;
  line-height: 1.35;
`;

export const SGoogleLoginButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 2.1rem;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm-2);
  ${padding('tb-sm-1', 'lr-sm-2')}
  ${radius("sm")}
  border: 0;
  color: ${cssTheme.colors.primaryText};
  background: ${cssTheme.colors.primary};
  font-weight: 800;
  cursor: pointer;

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover {
    filter: brightness(1.08);
  }
`;

export const SAuthForm = styled.form`
  display: grid;
  gap: var(--gap-sm-2);
`;

export const SAuthField = styled.div`
  display: grid;
  gap: 0.2rem;

  label {
    color: ${cssTheme.colors.text};
    font-size: 0.78rem;
    font-weight: 800;
    line-height: 1.2;
  }
`;

export const SAuthInput = styled.input`
  width: 100%;
  min-height: 1.8rem;
  ${padding('tb-sm-1', 'lr-sm-2')}
  ${radius("sm")}
  border: 1px solid color-mix(in srgb, ${cssTheme.colors.border} 70%, transparent);
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surface};
  font: inherit;
  font-size: 0.82rem;

  &::placeholder {
    color: ${cssTheme.colors.textMuted};
    opacity: 0.72;
  }

  &:focus-visible {
    outline: 2px solid ${cssTheme.colors.focus};
    outline-offset: 1px;
  }
`;

export const SAuthDivider = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--gap-sm-2);
  color: ${cssTheme.colors.textMuted};
  font-size: 0.76rem;
  line-height: 1;

  &::before,
  &::after {
    height: 1px;
    background: color-mix(in srgb, ${cssTheme.colors.textMuted} 55%, transparent);
    content: "";
  }
`;

export const SRegisterPrompt = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.2rem;
  color: ${cssTheme.colors.textMuted};
  font-size: 0.76rem;
  text-align: right;

  button {
    padding: 0;
    border: 0;
    color: ${cssTheme.colors.primary};
    background: transparent;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  button:hover {
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
`;

export const SAccountAction = styled(Link)`
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  ${padding('tb-sm-2', 'lr-md-2')}
  ${radius("md")}
  color: ${cssTheme.colors.accentText};
  background: ${cssTheme.colors.accent};
  font-weight: 800;
  text-align: center;

  &:hover {
    background: ${cssTheme.palette.amber};
  }
`;

export const SAccountLoginButton = styled.button`
  width: 100%;
  min-height: 2.2rem;
  ${padding('tb-sm-2', 'lr-lg-1')}
  ${radius("md")}
  border: 0;
  color: ${cssTheme.colors.accentText};
  background: ${cssTheme.colors.accent};
  font-weight: 800;
  cursor: pointer;
`;

export const SAccountLogoutButton = styled.button`
  width: 100%;
  min-height: 2.5rem;
  ${padding('tb-sm-2', 'lr-lg-1')}
  ${radius("md")}
  border: 1px solid ${cssTheme.colors.border};
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surface};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${cssTheme.colors.surfaceMuted};
  }
`;

export const SAccountNotice = styled.p`
  margin-top: var(--space-sm-2);
  color: ${cssTheme.colors.textMuted};
  font-size: 0.85rem;
`;

export const SAccountSectionHeading = styled.h3`
  margin: var(--space-md-2) 0 var(--space-sm-2);
  font-size: 0.95rem;
  font-weight: 800;
`;

export const SOrderList = styled.ul`
  display: grid;
  gap: var(--gap-sm-1);
  ${padding('none')}
  list-style: none;
`;

export const SOrderItem = styled.li`
  display: flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-sm-2);
  ${padding('tb-sm-1', 'lr-sm-2')}
  ${radius("sm")}
  background: ${cssTheme.colors.surface};
  font-size: 0.9rem;
`;

export const SOrderNumber = styled.strong`
  font-variant-numeric: tabular-nums;
`;

export const SOrderStatus = styled.span<{ $status: AccountOrderStatus }>`
  color: ${({ $status }) => {
    if ($status === "producing") return cssTheme.palette.white;
    if ($status === "problem") return cssTheme.colors.context.danger;
    return cssTheme.colors.textMuted;
  }};
  ${({ $status }) => $status === "producing" && `background: ${cssTheme.colors.context.success};`}
  ${padding('tb-sm-1', 'lr-sm-2')}
  ${radius("sm")}
  font-size: 0.8rem;
  font-weight: 700;
`;
