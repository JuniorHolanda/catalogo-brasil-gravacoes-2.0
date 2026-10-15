import { cssTheme } from "@/styles/theme";
import styled from 'styled-components';
import { Text } from '@/components/text';
import { flex, padding, radius } from '@/styles/mixins';

export const SFooter = styled.footer`
  width: 100%;
  ${padding('t-md-2')}
  color: ${cssTheme.colors.text};
`;

export const SFooterMain = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-lg-1);
  ${padding('t-md-2', 'b-md-1')}
  text-align: center;
`;

export const SFooterBrand = styled.a`
  ${flex({ direction: 'column', align: 'center', crossAlign: 'center' })}
  width: fit-content;
  color: inherit;
  font-family: var(--font-main), sans-serif;
  line-height: 0.9;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid ${cssTheme.colors.focus};
    outline-offset: 5px;
    ${radius('sm')}
  }
`;

export const SFooterLogo = styled.span`
  font-size: clamp(2.15rem, 8vw, 3.2rem);
  font-weight: 800;
  letter-spacing: 0.015em;
`;

export const SFooterContacts = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-sm-2);
`;

const footerContactStyles = `
  display: flex;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm-2);
  color: inherit;
  font-size: 0.9rem;
  line-height: 1.35;
  text-align: left;

  svg {
    flex: none;
    width: 1rem;
  }

  span {
    overflow-wrap: anywhere;
  }
`;

export const SFooterItem = styled.div`
  ${footerContactStyles}

  &[data-separated] {
    ${padding('t-md-2')}
  }
`;

export const SFooterLink = styled.a`
  ${footerContactStyles}
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  &:focus-visible {
    outline: 3px solid ${cssTheme.colors.focus};
    outline-offset: 4px;
    ${radius('sm')}
  }
`;

export const SFooterSignature = styled(Text)`
  position: relative;
  left: 50%;
  display: grid;
  width: 100vw;
  min-height: 5rem;
  place-items: center;
  transform: translateX(-50%);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  color: ${cssTheme.colors.primaryText};
  background: ${cssTheme.colors.primary};
  font-size: 0.82rem;
  font-weight: 500;
  text-align: center;

`;
