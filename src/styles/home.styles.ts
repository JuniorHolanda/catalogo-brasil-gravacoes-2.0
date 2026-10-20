import { cssTheme } from "@/styles/theme";
import styled from 'styled-components';
import { Text } from '@/components/text';
import { flex, font, padding, radius } from "@/styles/mixins";

export const SPage = styled.main`
  ${flex({ direction: 'column', align: 'top' })};
  align-items: center;
  ${padding('t-md-1')};
  width: 100%;
  min-height: 100vh;
  background: ${cssTheme.colors.background};
`;

export const SShell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 68rem;
  margin-bottom: -16px;
`;

export const SHeader = styled.header`
  ${flex({ align: 'center', justify: 'space-between', gap: 'md-2' })}
  width: 100%;
  ${padding('tb-sm-2', 'lr-md-2')}
  min-height: 3rem;
`;

export const SBrand = styled.a`
  ${flex({ align: 'center', gap: 'sm-2' })}
  ${font("text-md")}
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const SBrandMark = styled.span`
  display: inline-grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  ${radius('sm')}
  color: ${cssTheme.colors.primaryText};
  background: ${cssTheme.colors.primary};
  ${font("text-sm")}
  letter-spacing: 0.04em;
`;

export const SHero = styled.section`
  ${flex({ direction: 'column', align: 'top', gap: 'md-3' })}
  width: 100%;
  max-width: 47rem;
  ${padding('tb-sm-2', 'lr-md-2')}

  @media (max-width: 760px) {
    ${padding('tb-sm-2', 'lr-md-2')}
  }
`;

export const SEyebrow = styled(Text)`
  color: ${cssTheme.colors.textMuted};
  ${font("text-xs")}
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;

export const STitle = styled(Text)`
  max-width: 44rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 0.98;
`;

export const SDescription = styled(Text)`
  max-width: 38rem;
  color: ${cssTheme.colors.textMuted};
  ${font("text-lg")}
  line-height: 1.7;
`;
