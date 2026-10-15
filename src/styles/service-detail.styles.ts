import { cssTheme } from "@/styles/theme";
import Link from "next/link";
import styled from "styled-components";
import { Text } from "@/components/text";
import { padding, radius } from "@/styles/mixins";

export const SServicePage = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-md-3);
  width: 100%;
  ${padding('tb-md-3', 'lr-md-1')}

  @media (min-width: 760px) {
    ${padding('tb-xl-1')}
  }
`;

export const SServiceBackLink = styled(Link)`
  display: inline-flex;
  width: min(100%, 72rem);
  align-items: center;
  gap: var(--gap-sm-2);
  color: ${cssTheme.colors.textMuted};
  font-size: 0.95rem;
  font-weight: 700;

  &:hover {
    color: ${cssTheme.colors.text};
  }
`;

export const SServicePanel = styled.article`
  display: grid;
  width: min(100%, 72rem);
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
  overflow: hidden;
  border: 1px solid ${cssTheme.colors.border};
  ${radius("lg")}
  background: ${cssTheme.colors.surface};

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SServiceImageFrame = styled.div`
  position: relative;
  min-height: 32rem;
  overflow: hidden;
  background: ${cssTheme.colors.surfaceMuted};

  img {
    object-fit: cover;
  }

  @media (max-width: 720px) {
    min-height: 0;
    aspect-ratio: 1 / 0.88;
  }
`;

export const SServiceContent = styled.div`
  display: grid;
  grid-template-rows: auto auto auto auto 1fr auto;
  gap: var(--gap-md-2);
  ${padding('md-3')}

  @media (min-width: 760px) {
    ${padding('lg-2')}
  }
`;

export const SServiceKicker = styled(Text)`
  color: ${cssTheme.colors.textMuted};
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const SServiceTitle = styled(Text)`
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 0.9;
  text-transform: uppercase;
`;

export const SServiceTagline = styled(Text)`
  font-size: clamp(1.4rem, 3vw, 2rem);
  line-height: 1;
`;

export const SServiceDescription = styled(Text)`
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.4;
`;

export const SServiceDetails = styled(Text)`
  color: ${cssTheme.colors.textMuted};
  font-size: 1rem;
  line-height: 1.65;
`;

export const SServiceQuoteLink = styled.a`
  display: inline-flex;
  min-height: 3.5rem;
  align-items: center;
  justify-content: center;
  justify-self: start;
  align-self: end;
  gap: var(--gap-sm-2);
  ${padding('tb-sm-2', 'lr-lg-2')}
  ${radius("pill")}
  color: ${cssTheme.colors.primaryText};
  background: ${cssTheme.colors.primary};
  font-weight: 800;
  text-align: center;
  transition: transform 180ms ease, background-color 180ms ease;

  &:hover {
    transform: translateY(-2px);
    background: ${cssTheme.colors.accent};
    color: ${cssTheme.colors.accentText};
  }
`;
