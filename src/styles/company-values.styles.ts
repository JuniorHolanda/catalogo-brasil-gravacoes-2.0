import { cssTheme } from "@/styles/theme";
import styled from "styled-components";
import { padding } from "@/styles/mixins";

export const SCompanyValues = styled.section`
  display: grid;
  width: 100%;
  max-width: 44rem;
  gap: var(--gap-sm-2);
  align-self: center;
  ${padding('lr-md-1')}
  color: ${cssTheme.colors.text};
  text-align: center;
`;

export const SCompanyValuesItem = styled.article`
  display: grid;
  gap: var(--gap-sm-2);
  width: 100%;
`;

export const SCompanyValuesList = styled.ul`
  display: inline-grid;
  gap: 0.2rem;
  max-width: 100%;
  justify-self: center;
  ${padding('none')}
  text-align: center;
  list-style: none;

  li::marker {
    color: ${cssTheme.colors.accent};
  }
`;
