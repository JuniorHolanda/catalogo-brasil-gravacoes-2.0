import { cssTheme } from "@/styles/theme";
import Link from 'next/link';
import styled from 'styled-components';
import { Text } from '@/components/text';
import { elevation, font, padding, radius } from "@/styles/mixins";

export const SEngravingSection = styled.section`
  position: relative;
  align-self: flex-start;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg-2);
  width: 100vw;
  transform: translateX(-50%);
  ${padding('t-lg-3', 'lr-md-3', 'b-xl-1')}

  @media (min-width: 900px) {
    ${padding('lr-lg-2')}
  }
`;

export const SEngravingSectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm-2);
  max-width: 42rem;
`;

export const SEngravingSectionKicker = styled(Text)`
  color: ${cssTheme.colors.textMuted};
  ${font("text-xs")}
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;

export const SEngravingSectionTitle = styled(Text)`
  ${font("title-xl")}
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: 0.01em;
`;

export const SEngravingSectionDescription = styled(Text)`
  max-width: 38rem;
  color: ${cssTheme.colors.textMuted};
  ${font("text-lg")}
  line-height: 1.6;
`;

export const SEngravingCarouselViewport = styled.div`
  .swiper {
    ${padding('b-sm-2')}
  }

  .swiper-slide {
    display: flex;
    height: auto;
  }

  .swiper-slide > a {
    width: 100%;
  }
`;

export const SEngravingCardLink = styled(Link)`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: var(--gap-md-2);
  min-width: 0;
  width: 100%;
  min-height: 29rem;
  ${padding('md-2')}
  overflow: hidden;
  container-name: engraving-card;
  container-type: inline-size;
  border: 1px solid ${cssTheme.colors.border};
  ${radius('lg')}
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surface};
  ${elevation('low')}
  text-decoration: none;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;

  &:hover {
    transform: translateY(-0.2rem);
    ${elevation('medium')}
  }

  &:focus-visible {
    outline: 3px solid ${cssTheme.colors.focus};
    outline-offset: 3px;
  }
`;

export const SEngravingArtwork = styled.div`
  position: relative;
  min-height: 11rem;
`;

export const SEngravingImageTile = styled.div`
  position: absolute;
  z-index: 1;
  top: 3.9rem;
  left: 50%;
  width: clamp(3.5rem, 26cqi, 5.5rem);
  height: clamp(3.5rem, 26cqi, 5.5rem);
  overflow: hidden;
  transform: translateX(-50%);
  ${radius('md')}
  background: ${cssTheme.colors.surfaceMuted};

  img {
    object-fit: cover;
  }
`;

export const SEngravingArtworkRings = styled.span`
  /* O diâmetro é o dobro do anterior; cada slug desloca o recorte dos anéis. */
  position: absolute;
  top: -10rem;
  left: -92%;
  width: min(34rem, 192cqi);
  height: min(34rem, 192cqi);
  border: 1px solid currentColor;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle,
    transparent 0 4.9rem,
    currentColor 4.96rem 5.02rem
  );
  opacity: 0.1;

  &[data-layout='dtf'] {
    top: -8rem;
    left: -18%;
  }

  &[data-layout='transfer'] {
    top: -4rem;
    left: -76%;
  }

  &[data-layout='baixo-relevo'] {
    top: -6rem;
    left: -34%;
  }

  &[data-layout='laser'] {
    top: -11rem;
    left: -63%;
  }
`;

export const SEngravingTagline = styled.span`
  position: absolute;
  z-index: 2;
  top: 0.35rem;
  left: 0;
  width: 100%;
  color: ${cssTheme.colors.text};
  font-family: var(--font-secondary), cursive;
  ${font("title-fluid-sm")}
  font-style: italic;
  line-height: 1;
  text-align: center;
`;

export const SEngravingCardTitle = styled(Text)`
  font-family: var(--font-main), sans-serif;
  ${font("title-fluid-lg")}
  font-weight: 700;
  line-height: 0.86;
  letter-spacing: 0.01em;
  text-transform: uppercase;

  span {
    display: block;
    overflow-wrap: anywhere;
  }
`;

export const SEngravingCardDescription = styled(Text)`
  color: ${cssTheme.colors.textMuted};
  ${font("text-fluid-md")}
  font-weight: 700;
  line-height: 1.2;
`;

export const SEngravingCardAction = styled.span`
  display: flex;
  min-height: 3.5rem;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm-2);
  ${padding('tb-sm-2', 'lr-md-2')}
  ${radius('md')}
  color: ${cssTheme.colors.primaryText};
  background: ${cssTheme.colors.primary};
  ${font("text-fluid-sm")}
  font-weight: 800;
  letter-spacing: 0.04em;
  text-align: center;
  text-transform: uppercase;
`;
