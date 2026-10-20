import { cssTheme } from "@/styles/theme";
import styled, { css, keyframes } from 'styled-components';
import { Text } from '@/components/text';
import { elevation, flex, font, padding, radius } from "@/styles/mixins";
import type { PaletteToken } from '@/styles/theme';

/** Preenche a faixa ativa no mesmo intervalo usado pelo autoplay. */
const storyProgressAnimation = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

/** Move a seta do WhatsApp poucos pixels para indicar o gesto de arraste. */
const whatsappArrowMotion = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.2rem); }
`;
export const SStorySection = styled.section`
  display: none;
  width: 100%;
  width: 100%;
  ${padding('md')}

  @media (max-width: 760px) {
    ${flex({direction:'column', gap:'md-2'})}
  }
`;

export const SStoriesHeading = styled.div`
  ${flex({ align: 'center', justify: 'space-between', gap: 'md-2' })}
`;

export const SStoriesIntro = styled.div`
  ${flex({ direction: 'column', gap: 'sm-1', align:'center', justify:'center' })}
  height: fit-content;

  > span {
    color: ${cssTheme.colors.textMuted};
    ${font("text-xs")}
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  `;

export const SStoriesTitle = styled(Text)`
  ${font("text-lg")}
  font-weight: 700;
  letter-spacing: 0.01em;
`;

export const SCounter = styled.span`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 2.8rem;
  ${padding('tb-sm-1', 'lr-sm-2')}
  ${radius('pill')}
  color: ${cssTheme.colors.textMuted};
  background: ${cssTheme.colors.surfaceMuted};
  ${font("text-xs")}
  font-variant-numeric: tabular-nums;
  font-weight: 700;
`;

export const SViewer = styled.div`
  position: relative;
  overflow: hidden;
  ${radius('lg')}
  ${elevation('medium')}

  .mobile-stories-swiper {
    width: 100%;
    height: clamp(25rem, 68svh, 34rem);
  }

  .swiper-slide {
    height: 100%;
  }
`;

export const SStoryFrame = styled.article`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: ${cssTheme.colors.primary};
  color: ${cssTheme.colors.primaryText};
  ${radius('lg')}

  &::after {
    position: absolute;
    z-index: 1;
    inset: 38% 0 0;
    background: linear-gradient(
      transparent,
      color-mix(in srgb, ${cssTheme.palette.black} 72%, transparent)
    );
    content: '';
    pointer-events: none;
  }
`;

export const SStoryImageLayer = styled.div`
  position: absolute;
  inset: 0;

  img {
    object-fit: cover;
  }
`;

export const SStoryVideo = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: ${cssTheme.colors.primary};
  object-fit: cover;
`;

type StoryTone = 'navy' | 'amber' | 'stone';

type StoryTextCanvasProps = {
  $tone: StoryTone;
  $hasBackground?: boolean;
};

type StoryAtmospherePalette = {
  base: PaletteToken;
  clouds: StoryAtmosphereCloud[];
  noise: number;
};

type StoryAtmosphereCloud = {
  position: string;
  color: PaletteToken;
  opacity: number;
  spread: number;
};

type StoryAtmosphereVariant = {
  light: StoryAtmospherePalette;
  dark: StoryAtmospherePalette;
};

/** Converte manchas de cor em camadas de gradiente difusas. */
function createStoryClouds(...clouds: StoryAtmosphereCloud[]): string {
  return clouds
    .map(
      ({ position, color, opacity, spread }) =>
        `radial-gradient(ellipse at ${position}, color-mix(in srgb, ${cssTheme.palette[color]} ${opacity}%, transparent) 0%, transparent ${spread}%)`,
    )
    .join(', ');
}

// Cada par usa a paleta da marca e muda a posição das manchas e a força do grão.
const storyAtmosphereVariants: StoryAtmosphereVariant[] = [
  {
    light: {
      base: 'cream',
      clouds: [
        { position: '12% 35%', color: 'amber', opacity: 34, spread: 43 },
        { position: '78% 25%', color: 'navy', opacity: 22, spread: 48 },
        { position: '86% 83%', color: 'gray', opacity: 76, spread: 46 },
      ],
      noise: 0.12,
    },
    dark: {
      base: 'navy',
      clouds: [
        { position: '12% 35%', color: 'amber', opacity: 16, spread: 45 },
        { position: '78% 25%', color: 'black', opacity: 54, spread: 52 },
        { position: '86% 83%', color: 'stone', opacity: 22, spread: 48 },
      ],
      noise: 0.16,
    },
  },
  {
    light: {
      base: 'gray',
      clouds: [
        { position: '84% 18%', color: 'cream', opacity: 92, spread: 47 },
        { position: '22% 56%', color: 'navy', opacity: 23, spread: 48 },
        { position: '64% 94%', color: 'amber', opacity: 28, spread: 45 },
      ],
      noise: 0.09,
    },
    dark: {
      base: 'black',
      clouds: [
        { position: '84% 18%', color: 'stone', opacity: 22, spread: 48 },
        { position: '22% 56%', color: 'navy', opacity: 72, spread: 50 },
        { position: '64% 94%', color: 'amber', opacity: 15, spread: 46 },
      ],
      noise: 0.18,
    },
  },
  {
    light: {
      base: 'cream',
      clouds: [
        { position: '20% 12%', color: 'navy', opacity: 22, spread: 42 },
        { position: '91% 47%', color: 'amber', opacity: 33, spread: 50 },
        { position: '22% 90%', color: 'gray', opacity: 82, spread: 48 },
      ],
      noise: 0.14,
    },
    dark: {
      base: 'navy',
      clouds: [
        { position: '20% 12%', color: 'black', opacity: 48, spread: 45 },
        { position: '91% 47%', color: 'amber', opacity: 18, spread: 51 },
        { position: '22% 90%', color: 'stone', opacity: 22, spread: 48 },
      ],
      noise: 0.12,
    },
  },
  {
    light: {
      base: 'gray',
      clouds: [
        { position: '6% 76%', color: 'amber', opacity: 27, spread: 45 },
        { position: '71% 19%', color: 'navy', opacity: 24, spread: 49 },
        { position: '96% 91%', color: 'cream', opacity: 90, spread: 48 },
      ],
      noise: 0.11,
    },
    dark: {
      base: 'black',
      clouds: [
        { position: '6% 76%', color: 'amber', opacity: 15, spread: 46 },
        { position: '71% 19%', color: 'navy', opacity: 78, spread: 50 },
        { position: '96% 91%', color: 'stone', opacity: 23, spread: 48 },
      ],
      noise: 0.19,
    },
  },
  {
    light: {
      base: 'cream',
      clouds: [
        { position: '92% 37%', color: 'navy', opacity: 25, spread: 49 },
        { position: '33% 20%', color: 'gray', opacity: 88, spread: 43 },
        { position: '40% 94%', color: 'amber', opacity: 29, spread: 51 },
      ],
      noise: 0.08,
    },
    dark: {
      base: 'navy',
      clouds: [
        { position: '92% 37%', color: 'black', opacity: 56, spread: 50 },
        { position: '33% 20%', color: 'stone', opacity: 25, spread: 44 },
        { position: '40% 94%', color: 'amber', opacity: 17, spread: 51 },
      ],
      noise: 0.15,
    },
  },
  {
    light: {
      base: 'gray',
      clouds: [
        { position: '14% 18%', color: 'cream', opacity: 94, spread: 46 },
        { position: '97% 63%', color: 'navy', opacity: 25, spread: 49 },
        { position: '42% 95%', color: 'stone', opacity: 29, spread: 50 },
      ],
      noise: 0.15,
    },
    dark: {
      base: 'black',
      clouds: [
        { position: '14% 18%', color: 'stone', opacity: 24, spread: 47 },
        { position: '97% 63%', color: 'navy', opacity: 80, spread: 50 },
        { position: '42% 95%', color: 'amber', opacity: 14, spread: 51 },
      ],
      noise: 0.13,
    },
  },
  {
    light: {
      base: 'cream',
      clouds: [
        { position: '70% 8%', color: 'amber', opacity: 32, spread: 45 },
        { position: '7% 57%', color: 'gray', opacity: 95, spread: 47 },
        { position: '83% 93%', color: 'navy', opacity: 23, spread: 49 },
      ],
      noise: 0.1,
    },
    dark: {
      base: 'navy',
      clouds: [
        { position: '70% 8%', color: 'amber', opacity: 17, spread: 46 },
        { position: '7% 57%', color: 'stone', opacity: 24, spread: 48 },
        { position: '83% 93%', color: 'black', opacity: 52, spread: 50 },
      ],
      noise: 0.17,
    },
  },
  {
    light: {
      base: 'gray',
      clouds: [
        { position: '40% 30%', color: 'navy', opacity: 21, spread: 43 },
        { position: '97% 82%', color: 'cream', opacity: 94, spread: 48 },
        { position: '2% 92%', color: 'amber', opacity: 31, spread: 45 },
      ],
      noise: 0.13,
    },
    dark: {
      base: 'black',
      clouds: [
        { position: '40% 30%', color: 'navy', opacity: 76, spread: 45 },
        { position: '97% 82%', color: 'stone', opacity: 25, spread: 49 },
        { position: '2% 92%', color: 'amber', opacity: 17, spread: 47 },
      ],
      noise: 0.2,
    },
  },
];

const storyNoiseTexture = "url('/stories/noise.svg')";

type StoryAtmosphereProps = {
  $variant: number;
};

/** Monta as manchas difusas e ajusta a intensidade do ruído para cada tema. */
export const SStoryAtmosphere = styled.div<StoryAtmosphereProps>`
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background-color: ${({ $variant }) =>
    cssTheme.palette[storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].light.base]};
  pointer-events: none;

  &::before,
  &::after {
    position: absolute;
    inset: -3%;
    content: '';
  }

  &::before {
    background: ${({ $variant }) =>
      createStoryClouds(
        ...storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].light.clouds,
      )};
    filter: blur(0.45rem);
  }

  &::after {
    inset: 0;
    background-image: ${storyNoiseTexture};
    background-size: 11.25rem 11.25rem;
    mix-blend-mode: soft-light;
    opacity: ${({ $variant }) =>
      storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].light.noise};
  }

  html[data-theme='dark'] & {
    background-color: ${({ $variant }) =>
      cssTheme.palette[storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.base]};
  }

  html[data-theme='dark'] &::before {
    background: ${({ $variant }) =>
      createStoryClouds(
        ...storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.clouds,
      )};
  }

  html[data-theme='dark'] &::after {
    mix-blend-mode: screen;
    opacity: ${({ $variant }) =>
      storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.noise};
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) & {
      background-color: ${({ $variant }) =>
        cssTheme.palette[storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.base]};
    }

    :root:not([data-theme]) &::before {
      background: ${({ $variant }) =>
        createStoryClouds(
          ...storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.clouds,
        )};
    }

    :root:not([data-theme]) &::after {
      mix-blend-mode: screen;
      opacity: ${({ $variant }) =>
        storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.noise};
    }
  }
`;

export const SStoryTextCanvas = styled.div<StoryTextCanvasProps>`
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: start;
  gap: var(--gap-md-2);
  overflow: hidden;
  ${padding('lg-3')}
  color: ${({ $tone }) =>
    $tone === 'amber' ? cssTheme.colors.accentText : cssTheme.colors.primaryText};
  background: ${({ $tone }) => {
    if ($tone === 'amber') return cssTheme.colors.accent;
    if ($tone === 'stone') return cssTheme.palette.stone;
    return cssTheme.colors.primary;
  }};

  ${({ $hasBackground }) =>
    $hasBackground &&
    css`
      isolation: isolate;
      color: ${cssTheme.colors.text};
      background: ${cssTheme.colors.surface};

      &::after {
        position: absolute;
        z-index: 1;
        inset: 0;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, ${cssTheme.palette.cream} 10%, transparent) 0%,
          color-mix(in srgb, ${cssTheme.palette.cream} 14%, transparent) 56%,
          color-mix(in srgb, ${cssTheme.palette.navy} 58%, transparent) 100%
        );
        content: '';
        pointer-events: none;
      }

      > *:not([data-story-background]) {
        z-index: 2;
      }

      html[data-theme='dark'] & {
        color: ${cssTheme.palette.white};
        background: ${cssTheme.colors.primary};
      }

      html[data-theme='dark'] &::after {
        background: linear-gradient(
          180deg,
          color-mix(in srgb, ${cssTheme.palette.navy} 22%, transparent) 0%,
          color-mix(in srgb, ${cssTheme.palette.navy} 32%, transparent) 56%,
          color-mix(in srgb, ${cssTheme.palette.black} 68%, transparent) 100%
        );
      }

      @media (prefers-color-scheme: dark) {
        :root:not([data-theme]) & {
          color: ${cssTheme.palette.white};
          background: ${cssTheme.colors.primary};
        }

        :root:not([data-theme]) &::after {
          background: linear-gradient(
            180deg,
            color-mix(in srgb, ${cssTheme.palette.navy} 22%, transparent) 0%,
            color-mix(in srgb, ${cssTheme.palette.navy} 32%, transparent) 56%,
            color-mix(in srgb, ${cssTheme.palette.black} 68%, transparent) 100%
          );
        }
      }
    `}
`;

export const STextDecoration = styled.span`
  position: absolute;
  top: 18%;
  right: -4rem;
  width: 17rem;
  height: 17rem;
  border: 1px solid currentColor;
  border-radius: 50%;
  opacity: 0.2;
  box-shadow:
    0 0 0 2.2rem color-mix(in srgb, ${cssTheme.palette.white} 6%, transparent),
    0 0 0 4.4rem color-mix(in srgb, ${cssTheme.palette.white} 5%, transparent);
`;

export const SStoryTextMark = styled.span`
  position: relative;
  ${font("text-2xs")}
  font-weight: 800;
  letter-spacing: 0.14em;
`;

export const SStoryTextBody = styled(Text)`
  position: relative;
  max-width: 17rem;
  ${font("title-lg")}
  font-weight: 600;
  letter-spacing: -0.06em;
  line-height: 1.02;
`;

type StoryCopyProps = { $centered?: boolean };

export const SStoryCopy = styled.div<StoryCopyProps>`
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm-2);
  right: var(--space-md-3);
  bottom: var(--space-lg-3);
  left: var(--space-md-3);
  color: ${cssTheme.palette.white};
  text-align: ${({ $centered }) => ($centered ? 'center' : 'left')};
`;

export const SStoryTitle = styled(Text)`
  display: -webkit-box;
  overflow: hidden;
  ${font("text-xl")}
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const SStoryDescription = styled(Text)`
  display: -webkit-box;
  overflow: hidden;
  max-width: 27rem;
  ${font("text-sm")}
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const SStorySwipeLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-sm-1);
  color: ${cssTheme.palette.white};
  ${font("text-xs")}
  text-decoration: none;
  animation: ${whatsappArrowMotion} 1.2s ease-in-out infinite;

  small {
    ${font("text-lg")}
    font-weight: 600;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    > span {
      animation: none;
    }
  }
`;

type ProgressState = 'complete' | 'active' | 'upcoming';

type ProgressFillProps = {
  $state: ProgressState;
};

export const SProgressList = styled.div`
  position: absolute;
  z-index: 5;
  top: var(--space-md-2);
  right: var(--space-md-2);
  left: var(--space-md-2);
  display: flex;
  gap: 0.2rem;
`;

export const SProgressTrack = styled.span`
  flex: 1;
  min-width: 0;
  height: 0.18rem;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, ${cssTheme.palette.white} 48%, transparent);
`;

export const SProgressFill = styled.span<ProgressFillProps>`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: ${cssTheme.palette.white};
  transform-origin: left center;
  transform: ${({ $state }) => ($state === 'complete' ? 'scaleX(1)' : 'scaleX(0)')};
  animation: ${({ $state }) =>
    $state === 'active'
      ? css`
          ${storyProgressAnimation} 5s linear forwards
        `
      : 'none'};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: scaleX(0);
  }
`;
