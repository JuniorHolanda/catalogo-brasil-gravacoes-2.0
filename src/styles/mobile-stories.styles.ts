import styled, { css, keyframes } from 'styled-components';
import { elevation, flex, radius } from '@/styles/mixins';

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
export const StorySection = styled.section`
  display: none;

  @media (max-width: 760px) {
    display: block;
    margin-bottom: var(--margin-lg-3);
  }
`;

export const StoriesHeading = styled.div`
  ${flex({ align: 'center', justify: 'space-between', gap: 'md-2' })}
  margin-bottom: var(--margin-md-2);
`;

export const StoriesIntro = styled.div`
  ${flex({ direction: 'column', gap: 'sm-1' })}

  > span {
    color: var(--color-text-muted);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
`;

export const StoriesTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
`;

export const Counter = styled.span`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 2.8rem;
  padding: var(--padding-sm-1) var(--padding-sm-2);
  ${radius('pill')}
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
`;

export const Viewer = styled.div`
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

export const StoryFrame = styled.article`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: var(--color-primary);
  color: var(--color-primary-text);
  ${radius('lg')}

  &::after {
    position: absolute;
    z-index: 1;
    inset: 38% 0 0;
    background: linear-gradient(transparent, rgb(0 0 0 / 72%));
    content: '';
    pointer-events: none;
  }
`;

export const StoryImageLayer = styled.div`
  position: absolute;
  inset: 0;

  img {
    object-fit: cover;
  }
`;

export const StoryVideo = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: var(--color-primary);
  object-fit: cover;
`;

type StoryTone = 'navy' | 'amber' | 'stone';

type StoryTextCanvasProps = {
  $tone: StoryTone;
  $hasBackground?: boolean;
};

type StoryAtmospherePalette = {
  base: string;
  clouds: string;
  noise: number;
};

type StoryAtmosphereCloud = {
  position: string;
  color: string;
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
        `radial-gradient(ellipse at ${position}, rgb(${color} / ${opacity}%) 0%, transparent ${spread}%)`,
    )
    .join(', ');
}

// Cada par usa a paleta da marca e muda a posição das manchas e a força do grão.
const storyAtmosphereVariants: StoryAtmosphereVariant[] = [
  {
    light: {
      base: '#F0E2CB',
      clouds: createStoryClouds(
        { position: '12% 35%', color: '221 147 45', opacity: 34, spread: 43 },
        { position: '78% 25%', color: '0 39 70', opacity: 22, spread: 48 },
        { position: '86% 83%', color: '217 217 217', opacity: 76, spread: 46 },
      ),
      noise: 0.12,
    },
    dark: {
      base: '#002746',
      clouds: createStoryClouds(
        { position: '12% 35%', color: '221 147 45', opacity: 16, spread: 45 },
        { position: '78% 25%', color: '0 0 0', opacity: 54, spread: 52 },
        { position: '86% 83%', color: '125 118 106', opacity: 22, spread: 48 },
      ),
      noise: 0.16,
    },
  },
  {
    light: {
      base: '#D9D9D9',
      clouds: createStoryClouds(
        { position: '84% 18%', color: '240 226 203', opacity: 92, spread: 47 },
        { position: '22% 56%', color: '0 39 70', opacity: 23, spread: 48 },
        { position: '64% 94%', color: '221 147 45', opacity: 28, spread: 45 },
      ),
      noise: 0.09,
    },
    dark: {
      base: '#000000',
      clouds: createStoryClouds(
        { position: '84% 18%', color: '125 118 106', opacity: 22, spread: 48 },
        { position: '22% 56%', color: '0 39 70', opacity: 72, spread: 50 },
        { position: '64% 94%', color: '221 147 45', opacity: 15, spread: 46 },
      ),
      noise: 0.18,
    },
  },
  {
    light: {
      base: '#F0E2CB',
      clouds: createStoryClouds(
        { position: '20% 12%', color: '0 39 70', opacity: 22, spread: 42 },
        { position: '91% 47%', color: '221 147 45', opacity: 33, spread: 50 },
        { position: '22% 90%', color: '217 217 217', opacity: 82, spread: 48 },
      ),
      noise: 0.14,
    },
    dark: {
      base: '#002746',
      clouds: createStoryClouds(
        { position: '20% 12%', color: '0 0 0', opacity: 48, spread: 45 },
        { position: '91% 47%', color: '221 147 45', opacity: 18, spread: 51 },
        { position: '22% 90%', color: '125 118 106', opacity: 22, spread: 48 },
      ),
      noise: 0.12,
    },
  },
  {
    light: {
      base: '#D9D9D9',
      clouds: createStoryClouds(
        { position: '6% 76%', color: '221 147 45', opacity: 27, spread: 45 },
        { position: '71% 19%', color: '0 39 70', opacity: 24, spread: 49 },
        { position: '96% 91%', color: '240 226 203', opacity: 90, spread: 48 },
      ),
      noise: 0.11,
    },
    dark: {
      base: '#000000',
      clouds: createStoryClouds(
        { position: '6% 76%', color: '221 147 45', opacity: 15, spread: 46 },
        { position: '71% 19%', color: '0 39 70', opacity: 78, spread: 50 },
        { position: '96% 91%', color: '125 118 106', opacity: 23, spread: 48 },
      ),
      noise: 0.19,
    },
  },
  {
    light: {
      base: '#F0E2CB',
      clouds: createStoryClouds(
        { position: '92% 37%', color: '0 39 70', opacity: 25, spread: 49 },
        { position: '33% 20%', color: '217 217 217', opacity: 88, spread: 43 },
        { position: '40% 94%', color: '221 147 45', opacity: 29, spread: 51 },
      ),
      noise: 0.08,
    },
    dark: {
      base: '#002746',
      clouds: createStoryClouds(
        { position: '92% 37%', color: '0 0 0', opacity: 56, spread: 50 },
        { position: '33% 20%', color: '125 118 106', opacity: 25, spread: 44 },
        { position: '40% 94%', color: '221 147 45', opacity: 17, spread: 51 },
      ),
      noise: 0.15,
    },
  },
  {
    light: {
      base: '#D9D9D9',
      clouds: createStoryClouds(
        { position: '14% 18%', color: '240 226 203', opacity: 94, spread: 46 },
        { position: '97% 63%', color: '0 39 70', opacity: 25, spread: 49 },
        { position: '42% 95%', color: '125 118 106', opacity: 29, spread: 50 },
      ),
      noise: 0.15,
    },
    dark: {
      base: '#000000',
      clouds: createStoryClouds(
        { position: '14% 18%', color: '125 118 106', opacity: 24, spread: 47 },
        { position: '97% 63%', color: '0 39 70', opacity: 80, spread: 50 },
        { position: '42% 95%', color: '221 147 45', opacity: 14, spread: 51 },
      ),
      noise: 0.13,
    },
  },
  {
    light: {
      base: '#F0E2CB',
      clouds: createStoryClouds(
        { position: '70% 8%', color: '221 147 45', opacity: 32, spread: 45 },
        { position: '7% 57%', color: '217 217 217', opacity: 95, spread: 47 },
        { position: '83% 93%', color: '0 39 70', opacity: 23, spread: 49 },
      ),
      noise: 0.1,
    },
    dark: {
      base: '#002746',
      clouds: createStoryClouds(
        { position: '70% 8%', color: '221 147 45', opacity: 17, spread: 46 },
        { position: '7% 57%', color: '125 118 106', opacity: 24, spread: 48 },
        { position: '83% 93%', color: '0 0 0', opacity: 52, spread: 50 },
      ),
      noise: 0.17,
    },
  },
  {
    light: {
      base: '#D9D9D9',
      clouds: createStoryClouds(
        { position: '40% 30%', color: '0 39 70', opacity: 21, spread: 43 },
        { position: '97% 82%', color: '240 226 203', opacity: 94, spread: 48 },
        { position: '2% 92%', color: '221 147 45', opacity: 31, spread: 45 },
      ),
      noise: 0.13,
    },
    dark: {
      base: '#000000',
      clouds: createStoryClouds(
        { position: '40% 30%', color: '0 39 70', opacity: 76, spread: 45 },
        { position: '97% 82%', color: '125 118 106', opacity: 25, spread: 49 },
        { position: '2% 92%', color: '221 147 45', opacity: 17, spread: 47 },
      ),
      noise: 0.2,
    },
  },
];

const storyNoiseTexture = "url('/stories/noise.svg')";

type StoryAtmosphereProps = {
  $variant: number;
};

/** Monta as manchas difusas e ajusta a intensidade do ruído para cada tema. */
export const StoryAtmosphere = styled.div<StoryAtmosphereProps>`
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background-color: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].light.base};
  pointer-events: none;

  &::before,
  &::after {
    position: absolute;
    inset: -3%;
    content: '';
  }

  &::before {
    background: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].light.clouds};
    filter: blur(0.45rem);
  }

  &::after {
    inset: 0;
    background-image: ${storyNoiseTexture};
    background-size: 11.25rem 11.25rem;
    mix-blend-mode: soft-light;
    opacity: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].light.noise};
  }

  html[data-theme='dark'] & {
    background-color: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.base};
  }

  html[data-theme='dark'] &::before {
    background: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.clouds};
  }

  html[data-theme='dark'] &::after {
    mix-blend-mode: screen;
    opacity: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.noise};
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) & {
      background-color: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.base};
    }

    :root:not([data-theme]) &::before {
      background: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.clouds};
    }

    :root:not([data-theme]) &::after {
      mix-blend-mode: screen;
      opacity: ${({ $variant }) => storyAtmosphereVariants[$variant % storyAtmosphereVariants.length].dark.noise};
    }
  }
`;

export const StoryTextCanvas = styled.div<StoryTextCanvasProps>`
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: start;
  overflow: hidden;
  padding: var(--padding-lg-3);
  color: ${({ $tone }) =>
    $tone === 'amber' ? 'var(--color-accent-text)' : 'var(--color-primary-text)'};
  background: ${({ $tone }) => {
    if ($tone === 'amber') return 'var(--color-accent)';
    if ($tone === 'stone') return 'var(--color-text-muted)';
    return 'var(--color-primary)';
  }};

  ${({ $hasBackground }) =>
    $hasBackground &&
    css`
      isolation: isolate;
      color: var(--color-text);
      background: var(--color-surface);

      &::after {
        position: absolute;
        z-index: 1;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgb(240 226 203 / 10%) 0%,
          rgb(240 226 203 / 14%) 56%,
          rgb(0 39 70 / 58%) 100%
        );
        content: '';
        pointer-events: none;
      }

      > *:not([data-story-background]) {
        z-index: 2;
      }

      html[data-theme='dark'] & {
        color: var(--palette-white);
        background: var(--color-primary);
      }

      html[data-theme='dark'] &::after {
        background: linear-gradient(
          180deg,
          rgb(0 39 70 / 22%) 0%,
          rgb(0 39 70 / 32%) 56%,
          rgb(0 0 0 / 68%) 100%
        );
      }

      @media (prefers-color-scheme: dark) {
        :root:not([data-theme]) & {
          color: var(--palette-white);
          background: var(--color-primary);
        }

        :root:not([data-theme]) &::after {
          background: linear-gradient(
            180deg,
            rgb(0 39 70 / 22%) 0%,
            rgb(0 39 70 / 32%) 56%,
            rgb(0 0 0 / 68%) 100%
          );
        }
      }
    `}
`;

export const TextDecoration = styled.span`
  position: absolute;
  top: 18%;
  right: -4rem;
  width: 17rem;
  height: 17rem;
  border: 1px solid currentColor;
  border-radius: 50%;
  opacity: 0.2;
  box-shadow:
    0 0 0 2.2rem rgb(255 255 255 / 6%),
    0 0 0 4.4rem rgb(255 255 255 / 5%);
`;

export const StoryTextMark = styled.span`
  position: relative;
  margin-bottom: var(--margin-md-2);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
`;

export const StoryTextBody = styled.p`
  position: relative;
  max-width: 17rem;
  margin: 0;
  font-size: clamp(1.8rem, 8vw, 2.6rem);
  font-weight: 600;
  letter-spacing: -0.06em;
  line-height: 1.02;
  text-wrap: balance;
`;

type StoryCopyProps = { $centered?: boolean };

export const StoryCopy = styled.div<StoryCopyProps>`
  position: absolute;
  z-index: 3;
  right: var(--padding-md-3);
  bottom: var(--padding-lg-3);
  left: var(--padding-md-3);
  color: var(--palette-white);
  text-align: ${({ $centered }) => ($centered ? 'center' : 'left')};
`;

export const StoryTitle = styled.h3`
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 var(--margin-sm-1);
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const StoryDescription = styled.p`
  display: -webkit-box;
  overflow: hidden;
  max-width: 27rem;
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const StorySwipeLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-sm-1);
  margin-top: var(--margin-sm-2);
  color: var(--palette-white);
  font-size: 0.68rem;
  text-decoration: none;
  animation: ${whatsappArrowMotion} 1.2s ease-in-out infinite;

  small {
    font-size: large;
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

export const ProgressList = styled.div`
  position: absolute;
  z-index: 5;
  top: var(--padding-md-2);
  right: var(--padding-md-2);
  left: var(--padding-md-2);
  display: flex;
  gap: 0.2rem;
`;

export const ProgressTrack = styled.span`
  flex: 1;
  min-width: 0;
  height: 0.18rem;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: rgb(255 255 255 / 48%);
`;

export const ProgressFill = styled.span<ProgressFillProps>`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--palette-white);
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
