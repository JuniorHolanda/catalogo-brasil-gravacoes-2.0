import styled from "styled-components";
import { cssTheme } from "@/styles/theme";
import { padding, radius, font } from "@/styles/mixins";

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
    ${font("text-sm")}
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  h1 {
    ${font("title-lg")}
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
  background: ${cssTheme.colors.background};

  @media (min-width: 760px) {
    ${padding("lg-1")}
  }
`;

export const SQuoteHeading = styled.div`
  h2,
  p {
    margin: 0;
  }

  h2 {
    ${font("title-lg")}
    line-height: 1.1;
  }

  p {
    margin-top: var(--space-sm-1);
    color: ${cssTheme.colors.textMuted};
    ${font("text-md")}
    line-height: 1.35;
  }
`;

export const SQuoteForm = styled.form`
  display: grid;
  gap: var(--gap-md-2);
`;

export const SQuoteTopFields = styled.div`
  display: grid;
  gap: var(--gap-md-2);
  padding-bottom: var(--space-md-1);
  border-bottom: 1px solid ${cssTheme.colors.border};

  @media (min-width: 560px) {
    grid-template-columns: minmax(0, 1fr) minmax(10rem, 0.65fr);
    align-items: end;
  }
`;

export const SQuoteEngravings = styled.section`
  display: grid;
  gap: var(--gap-md-2);
`;

export const SArtworkCard = styled.section`
  display: grid;
  min-width: 0;
  gap: var(--gap-md-1);
  padding-top: var(--space-md-1);
  border-top: 1px solid ${cssTheme.colors.border};
`;

export const SArtworkHeader = styled.div`
  display: flex;
  min-height: 1.5rem;
  align-items: center;
  justify-content: flex-end;
  gap: var(--gap-sm-2);
`;

export const SArtworkLegend = styled.h3`
  margin: 0;
  color: ${cssTheme.colors.textMuted};
  ${font("text-sm")}
  font-weight: 800;
`;

export const SRemoveEngravingButton = styled.button`
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  gap: var(--gap-sm-1);
  ${padding("tb-sm-1", "lr-sm-1")}
  ${radius("sm")}
  border: 0;
  color: ${cssTheme.colors.context.danger};
  background: ${cssTheme.colors.surface};
  font: inherit;
  ${font("text-sm")}
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
  color: ${cssTheme.colors.accentText};
  background: ${cssTheme.colors.accent};
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

export const SQuoteField = styled.label`
  display: grid;
  min-width: 0;
  gap: var(--gap-sm-1);
  color: ${cssTheme.colors.text};
  ${font("text-md")}
  font-weight: 800;

  input,
  select,
  textarea {
    width: 100%;
    min-height: 2.6rem;
    ${padding("tb-sm-1", "lr-md-1")}
    ${radius("md")}
    border: 1px solid transparent;
    color: ${cssTheme.colors.text};
    background: ${cssTheme.colors.surface};
    font: inherit;
    ${font("text-md")}
    font-weight: 400;

    &:focus-visible {
      outline: 2px solid ${cssTheme.colors.focus};
      outline-offset: 1px;
    }
  }

  input::placeholder,
  textarea::placeholder {
    color: ${cssTheme.colors.textMuted};
    opacity: 0.55;
    text-align: center;
  }

  textarea {
    min-height: 7rem;
    resize: vertical;
  }
`;

export const SQuoteDimensions = styled.div`
  display: grid;
  gap: var(--gap-md-1);

  @media (min-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const SQuoteUpload = styled.label<{ $disabled?: boolean }>`
  position: relative;
  display: grid;
  min-height: 10rem;
  align-content: center;
  justify-items: center;
  gap: var(--gap-sm-2);
  ${padding("md-2")}
  ${radius("lg")}
  border: 1px dashed ${cssTheme.colors.textMuted};
  color: ${cssTheme.colors.text};
  background: color-mix(in srgb, ${cssTheme.colors.background} 70%, ${cssTheme.colors.surface});
  text-align: center;
  ${font("text-sm")}
  cursor: ${({ $disabled }) => $disabled ? "wait" : "pointer"};
  opacity: ${({ $disabled }) => $disabled ? 0.72 : 1};

  strong {
    display: grid;
    justify-items: center;
    gap: var(--gap-sm-1);
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  strong svg {
    width: 2.8rem;
    height: 2.8rem;
  }

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

export const SArtworkFileBadge = styled.div`
  display: inline-flex;
  max-width: 5rem;
  min-height: 4rem;
  align-items: center;
  justify-content: center;
  ${padding("tb-sm-2", "lr-sm-2")}
  ${radius("pill")}
  overflow: hidden;
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.border};
  ${font("text-xs")}
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
`;

export const SQuotePreview = styled.section`
  display: grid;
  justify-items: center;
  gap: var(--gap-sm-1);
  padding: var(--space-lg-1) 0;
  text-align: center;
`;

export const SQuotePreviewLabel = styled.p`
  margin: 0;
  ${font("text-lg")}
  font-weight: 800;
`;

export const SQuotePreviewAmount = styled.p`
  margin: 0;
  color: ${cssTheme.colors.text};
  ${font("title-display")}
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1;
  overflow-wrap: anywhere;
`;

export const SQuotePreviewMessage = styled.p`
  max-width: 34rem;
  margin: 0;
  color: ${cssTheme.colors.textMuted};
  ${font("text-md")}
  line-height: 1.4;
`;

export const SQuoteContact = styled.section`
  display: grid;
  gap: var(--gap-md-1);
`;

export const SQuoteContactHeading = styled.h3`
  margin: 0;
  color: ${cssTheme.colors.text};
  ${font("text-xl")}
`;

export const SQuoteContactGrid = styled.div`
  display: grid;
  gap: var(--gap-md-1);

  @media (min-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const SQuoteActions = styled.div`
  display: grid;
  gap: var(--gap-sm-2);

  @media (min-width: 480px) {
    grid-template-columns: minmax(6.5rem, 0.42fr) minmax(0, 1fr);
    align-items: stretch;
  }
`;

export const SQuoteSaveButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  ${padding("tb-sm-2", "lr-md-2")}
  ${radius("md")}
  border: 0;
  color: ${cssTheme.colors.primaryText};
  background: ${cssTheme.colors.context.success};
  font: inherit;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

export const SWhatsAppQuoteButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 3rem;
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
  min-height: 3rem;
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
  ${font("text-md")}
  font-weight: 700;
  line-height: 1.4;

  a {
    display: inline-block;
    margin-top: var(--space-sm-2);
    color: ${cssTheme.colors.primary};
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
    ${font("text-xl")}
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
