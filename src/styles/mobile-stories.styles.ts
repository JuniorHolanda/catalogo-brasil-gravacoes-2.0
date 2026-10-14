import styled, { css, keyframes } from "styled-components";
import { elevation, flex, radius } from "@/styles/mixins";

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
  ${flex({ align: "center", justify: "space-between", gap: "md-2" })}
  margin-bottom: var(--margin-md-2);
`;

export const StoriesIntro = styled.div`
  ${flex({ direction: "column", gap: "sm-1" })}

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
  letter-spacing: -0.03em;
`;

export const Counter = styled.span`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 2.8rem;
  padding: var(--padding-sm-1) var(--padding-sm-2);
  ${radius("pill")}
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
`;

export const Viewer = styled.div`
  position: relative;
  overflow: hidden;
  ${radius("lg")}
  ${elevation("medium")}

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
  ${radius("lg")}

  &::after {
    position: absolute;
    z-index: 1;
    inset: 38% 0 0;
    background: linear-gradient(transparent, rgb(0 0 0 / 72%));
    content: "";
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

type StoryTone = "navy" | "amber" | "stone";

type StoryTextCanvasProps = {
  $tone: StoryTone;
};

export const StoryTextCanvas = styled.div<StoryTextCanvasProps>`
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: start;
  overflow: hidden;
  padding: var(--padding-lg-3);
  color: ${({ $tone }) => ($tone === "amber" ? "var(--color-accent-text)" : "var(--color-primary-text)")};
  background: ${({ $tone }) => {
    if ($tone === "amber") return "var(--color-accent)";
    if ($tone === "stone") return "var(--color-text-muted)";
    return "var(--color-primary)";
  }};
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
  text-align: ${({ $centered }) => ($centered ? "center" : "left")};
`;

export const StoryTitle = styled.h3`
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 var(--margin-sm-1);
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: -0.03em;
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

  > span {
    display: grid;
    width: 1rem;
    height: 1rem;
    place-items: center;
    font-size: 0.78rem;
    line-height: 1;
    animation: ${whatsappArrowMotion} 1.2s ease-in-out infinite;
  }

  small {
    font-size: 0.68rem;
    font-weight: 600;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    > span { animation: none; }
  }
`;

type ProgressState = "complete" | "active" | "upcoming";

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
  transform: ${({ $state }) => ($state === "complete" ? "scaleX(1)" : "scaleX(0)")};
  animation: ${({ $state }) =>
    $state === "active"
      ? css`${storyProgressAnimation} 5s linear forwards`
      : "none"};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: scaleX(0);
  }
`;
