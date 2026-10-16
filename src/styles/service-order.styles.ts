import styled from "styled-components";
import { cssTheme } from "@/styles/theme";
import { padding, radius } from "@/styles/mixins";

export const SServiceBanner = styled.header`
  position: relative;
  width: min(100%, 72rem);
  min-height: 11rem;
  aspect-ratio: 2.4 / 1;
  overflow: hidden;
  ${radius("lg")}
  background: ${cssTheme.colors.surfacePanel};

  img {
    object-fit: cover;
  }

  &::after {
    position: absolute;
    inset: 35% 0 0;
    content: "";
    background: linear-gradient(transparent, color-mix(in srgb, ${cssTheme.colors.text} 75%, transparent));
  }

  @media (max-width: 600px) {
    min-height: 9rem;
    aspect-ratio: 1.45 / 1;
  }
`;

export const SServiceBannerCopy = styled.div`
  position: absolute;
  z-index: 1;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  gap: var(--gap-sm-1);
  ${padding("md-2")}
  color: ${cssTheme.colors.primaryText};

  p,
  h1 {
    margin: 0;
  }

  p {
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  h1 {
    font-size: clamp(1.7rem, 6vw, 3rem);
    line-height: 1;
    text-transform: uppercase;
  }

  @media (min-width: 760px) {
    ${padding("lg-2")}
  }
`;

export const SQuoteCard = styled.section`
  display: grid;
  width: min(100%, 72rem);
  gap: var(--gap-md-2);
  ${padding("md-2")}
  ${radius("lg")}
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surface};
  box-shadow: ${cssTheme.shadows.medium};

  @media (min-width: 760px) {
    ${padding("lg-1")}
  }
`;

export const SQuoteHeading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap-md-2);

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: clamp(1.15rem, 3vw, 1.5rem);
    line-height: 1.1;
  }

  p {
    margin-top: var(--space-sm-1);
    color: ${cssTheme.colors.textMuted};
    font-size: 0.88rem;
    line-height: 1.35;
  }
`;

export const SQuoteForm = styled.form`
  display: grid;
  gap: var(--gap-md-2);
`;

export const SQuoteEngravings = styled.section`
  display: grid;
  gap: var(--gap-md-2);
  padding-top: var(--space-md-1);
  border-top: 1px solid ${cssTheme.colors.border};
`;

export const SArtworkCard = styled.fieldset`
  position: relative;
  display: grid;
  min-width: 0;
  gap: var(--gap-md-2);
  margin: 0;
  ${padding("md-2")}
  ${radius("md")}
  border: 1px dashed ${cssTheme.colors.textMuted};
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surface};

  @media (max-width: 420px) {
    ${padding("md-1")}
  }
`;

export const SArtworkLegend = styled.legend`
  padding: 0 var(--space-sm-1);
  color: ${cssTheme.colors.textMuted};
  font-size: 0.8rem;
  font-weight: 800;
`;

export const SRemoveEngravingButton = styled.button`
  position: absolute;
  top: var(--space-sm-1);
  right: var(--space-sm-1);
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  gap: var(--gap-sm-1);
  ${padding("tb-sm-1", "lr-sm-1")}
  ${radius("sm")}
  border: 0;
  color: ${cssTheme.colors.context.danger};
  background: ${cssTheme.colors.surfaceMuted};
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

export const SAddEngravingButton = styled.button`
  display: inline-flex;
  min-height: 2.4rem;
  justify-self: end;
  align-items: center;
  gap: var(--gap-sm-1);
  ${padding("tb-sm-1", "lr-md-2")}
  ${radius("md")}
  border: 0;
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surfacePanel};
  font: inherit;
  font-weight: 800;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${cssTheme.colors.focus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SProductOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-sm-2);
`;

export const SProductOption = styled.button<{ $selected?: boolean }>`
  min-height: 2.25rem;
  ${padding("tb-sm-1", "lr-md-2")}
  ${radius("pill")}
  border: 1px solid ${cssTheme.colors.border};
  color: ${({ $selected }) => $selected ? cssTheme.colors.primaryText : cssTheme.colors.text};
  background: ${({ $selected }) => $selected ? cssTheme.colors.primary : cssTheme.colors.surfaceMuted};
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${cssTheme.colors.focus};
    outline-offset: 2px;
  }
`;

export const SQuoteField = styled.label`
  display: grid;
  min-width: 0;
  gap: var(--gap-sm-1);
  color: ${cssTheme.colors.text};
  font-size: 0.88rem;
  font-weight: 800;

  input,
  select {
    width: 100%;
    min-height: 2.6rem;
    ${padding("tb-sm-1", "lr-sm-2")}
    ${radius("sm")}
    border: 1px solid ${cssTheme.colors.border};
    color: ${cssTheme.colors.text};
    background: ${cssTheme.colors.surfaceMuted};
    font: inherit;
    font-size: 0.88rem;
    font-weight: 400;

    &:focus-visible {
      outline: 2px solid ${cssTheme.colors.focus};
      outline-offset: 1px;
    }
  }

  input::placeholder {
    color: ${cssTheme.colors.textMuted};
    opacity: 0.72;
  }
`;

export const SQuoteDimensions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--gap-sm-2);
`;

export const SQuoteUpload = styled.label<{ $disabled?: boolean }>`
  display: grid;
  min-height: 5rem;
  place-items: center;
  gap: var(--gap-sm-1);
  ${padding("md-2")}
  ${radius("md")}
  border: 1px dashed ${cssTheme.colors.textMuted};
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surfaceMuted};
  text-align: center;
  font-size: 0.8rem;
  cursor: ${({ $disabled }) => $disabled ? "wait" : "pointer"};
  opacity: ${({ $disabled }) => $disabled ? 0.72 : 1};

  span {
    color: ${cssTheme.colors.textMuted};
    font-weight: 400;
  }

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &:focus-within {
    outline: 3px solid ${cssTheme.colors.focus};
    outline-offset: 2px;
  }
`;

export const SQuoteActions = styled.div`
  display: grid;
  gap: var(--gap-sm-2);
`;

export const SWhatsAppQuoteButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 2.8rem;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm-2);
  ${padding("tb-sm-2", "lr-md-2")}
  ${radius("md")}
  border: 0;
  color: ${cssTheme.colors.accentText};
  background: ${cssTheme.colors.accent};
  font: inherit;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

export const SCalculateButton = styled.button<{ $unavailable?: boolean }>`
  display: flex;
  width: 100%;
  min-height: 2.8rem;
  align-items: center;
  justify-content: center;
  ${padding("tb-sm-2", "lr-md-2")}
  ${radius("md")}
  border: 0;
  color: ${({ $unavailable }) => $unavailable ? cssTheme.colors.textMuted : cssTheme.colors.primaryText};
  background: ${({ $unavailable }) => $unavailable ? cssTheme.colors.surfacePanel : cssTheme.colors.primary};
  font: inherit;
  font-weight: 800;
  cursor: ${({ $unavailable }) => $unavailable ? "not-allowed" : "pointer"};
  opacity: ${({ $unavailable }) => $unavailable ? 0.75 : 1};

  &:disabled:not([aria-disabled="false"]) {
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    filter: brightness(1.08);
  }
`;

export const SQuoteNotice = styled.p<{ $error?: boolean }>`
  margin: 0;
  color: ${({ $error }) => $error ? cssTheme.colors.context.danger : cssTheme.colors.context.success};
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.4;

  a {
    display: inline-block;
    margin-top: var(--space-sm-2);
    color: ${cssTheme.colors.primaryText};
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
`;

export const SServiceInformation = styled.article`
  width: min(100%, 72rem);
  ${padding("md-2")}
  ${radius("lg")}
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surfacePanel};

  h2 {
    margin: 0 0 var(--space-sm-2);
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    line-height: 1.55;
  }

  p + p {
    margin-top: var(--space-sm-2);
    color: ${cssTheme.colors.textMuted};
  }
`;
