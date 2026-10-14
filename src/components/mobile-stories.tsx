"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay } from "swiper/modules";
import { createWhatsAppLink } from "@/lib/whatsapp";
import {
  Counter,
  ProgressList,
  ProgressFill,
  ProgressTrack,
  StoryCopy,
  StoryDescription,
  StoryFrame,
  StoryAtmosphere,
  StoryImageLayer,
  StorySection,
  StorySwipeLink,
  StoryTextBody,
  StoryTextCanvas,
  StoryTextMark,
  StoryTitle,
  StoryVideo,
  TextDecoration,
  StoriesHeading,
  StoriesIntro,
  StoriesTitle,
  Viewer,
} from "@/styles/mobile-stories.styles";
import { FaWhatsapp } from "react-icons/fa";

export type StoryTone = "navy" | "amber" | "stone";

/** Define os formatos de mídia aceitos pelo carrossel de stories. */
export type StoryMedia =
  | { type: "image" | "gif"; src: string; alt: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "text"; content: string; tone?: StoryTone };

/** Reúne o conteúdo textual e a mídia de um story. */
export type StoryItem = {
  id: string;
  title: string;
  description: string;
  media: StoryMedia;
  link?: string;
  variant?: "whatsapp";
};

type MobileStoriesProps = {
  stories?: StoryItem[];
  backgroundVariant: number;
};

const STORY_DURATION_MS = 5000;
const whatsappLink = createWhatsAppLink();

const defaultStories: StoryItem[] = [
  {
    id: "story-01",
    title: "Serigrafia com identidade",
    description: "Criamos produtos que representam a identidade de cada cliente.",
    media: {
      type: "image",
      src: "https://res.cloudinary.com/zuofqjtd/image/upload/v1791985738/05.jpg",
      alt: "Gravação personalizada em uma peça",
    },
  },
  {
    id: "story-02",
    title: "Técnica em cada detalhe",
    description: "Unimos criatividade e cuidado para transformar ideias em produtos.",
    media: {
      type: "image",
      src: "https://res.cloudinary.com/zuofqjtd/image/upload/v1791985738/04.jpg",
      alt: "Aplicação cuidadosa de uma gravação em tecido",
    },
  },
  {
    id: "story-03",
    title: "Originalidade em cada projeto",
    description: "Soluções criativas com consistência do primeiro traço ao acabamento.",
    media: {
      type: "image",
      src: "https://res.cloudinary.com/zuofqjtd/image/upload/v1791985737/03.jpg",
      alt: "Equipe preparando uma peça personalizada na oficina",
    },
  },
  {
    id: "story-whatsapp",
    title: "WhatsApp",
    description: "Chame no WhatsApp e conte sua ideia. Nossa equipe cuida de cada detalhe.",
    media: {
      type: "text",
      content: "Vamos criar com você?",
      tone: "stone",
    },
    link: whatsappLink,
    variant: "whatsapp",
  },
  {
    id: "story-04",
    title: "Qualidade em cada etapa",
    description: "Atenção ao processo para entregar produtos bem-feitos e consistentes.",
    media: {
      type: "image",
      src: "https://res.cloudinary.com/zuofqjtd/image/upload/v1791985737/06.jpg",
      alt: "Produtos personalizados organizados para entrega",
    },
  },
  {
    id: "story-05",
    title: "Criatividade que vira produto",
    description: "Peças originais para destacar a identidade de cada cliente.",
    media: {
      type: "image",
      src: "https://res.cloudinary.com/zuofqjtd/image/upload/v1791985736/02.jpg",
      alt: "Peças gravadas preparadas em uma caixa",
    },
  },
  {
    id: "story-06",
    title: "Produção independente",
    description: "Produção consciente, transparência e compromisso em cada projeto.",
    media: {
      type: "image",
      src: "https://res.cloudinary.com/zuofqjtd/image/upload/v1791985571/banner-stories/01.jpg",
      alt: "Equipe trabalhando em um projeto de gravação",
    },
  },
];

/** Limita o texto exibido a 80 caracteres sem separar caracteres acentuados. */
function limitStoryText(text: string): string {
  const characters = Array.from(text.trim());

  if (characters.length <= 80) return characters.join("");
  return `${characters.slice(0, 79).join("")}…`;
}

/** Aceita apenas caminhos locais ou URLs HTTPS para carregar mídias. */
function isSafeMediaSource(source: string): boolean {
  return /^(https:\/\/|\/(?!\/))/i.test(source);
}

/** Permite links locais ou HTTPS para manter a navegação em protocolos seguros. */
function isSafeStoryLink(link: string | undefined): link is string {
  return Boolean(link && /^(https:\/\/|\/(?!\/))/i.test(link));
}

/** Desenha a mídia de acordo com o formato informado no story. */
function StoryVisual({
  story,
  backgroundVariant,
}: {
  story: StoryItem;
  backgroundVariant: number;
}) {
  if (story.media.type === "text") {
    return (
      <StoryTextCanvas
        $tone={story.media.tone ?? "navy"}
        $hasBackground={story.variant === "whatsapp"}
      >
        {story.variant === "whatsapp" && (
          <StoryAtmosphere
            $variant={backgroundVariant}
            aria-hidden="true"
            data-story-background=""
          />
        )}
        {story.variant !== "whatsapp" && <TextDecoration aria-hidden="true" />}
        <StoryTextMark>BRASIL GRAVAÇÕES</StoryTextMark>
        <StoryTextBody>{limitStoryText(story.media.content)}</StoryTextBody>
      </StoryTextCanvas>
    );
  }

  if (!isSafeMediaSource(story.media.src)) {
    return (
      <StoryTextCanvas $tone="navy">
        <StoryTextBody>Mídia indisponível</StoryTextBody>
      </StoryTextCanvas>
    );
  }

  if (story.media.type === "video") {
    const poster = story.media.poster && isSafeMediaSource(story.media.poster)
      ? story.media.poster
      : undefined;

    return (
      <StoryVideo
        aria-label={story.title}
        controls
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={story.media.src} />
        Seu navegador não oferece suporte a este vídeo.
      </StoryVideo>
    );
  }

  return (
    <StoryImageLayer>
      <Image
        src={story.media.src}
        alt={story.media.alt}
        fill
        sizes="(max-width: 760px) 100vw, 480px"
        unoptimized
        loading="lazy"
      />
    </StoryImageLayer>
  );
}

/** Apresenta stories mobile com suporte a imagem, GIF, vídeo e conteúdo textual. */
export function MobileStories({
  stories = defaultStories,
  backgroundVariant,
}: MobileStoriesProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /** Inicia ou pausa a troca automática conforme a preferência de movimento. */
  useEffect(() => {
    if (stories.length < 2) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 760px)");

    /** Sincroniza o autoplay quando a preferência do sistema mudar. */
    const updateAutoplay = () => {
      const swiper = swiperRef.current;
      if (!swiper || swiper.destroyed) return;

      if (mediaQuery.matches || !mobileQuery.matches) {
        swiper.autoplay.stop();
      } else if (!swiper.autoplay.running) {
        swiper.autoplay.start();
      }
    };

    updateAutoplay();
    mediaQuery.addEventListener("change", updateAutoplay);
    mobileQuery.addEventListener("change", updateAutoplay);

    return () => {
      mediaQuery.removeEventListener("change", updateAutoplay);
      mobileQuery.removeEventListener("change", updateAutoplay);
    };
  }, [stories.length]);

  /** Guarda a instância do Swiper e interrompe o autoplay se houver movimento reduzido. */
  function handleSwiper(swiper: SwiperInstance) {
    swiperRef.current = swiper;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileScreen = window.matchMedia("(max-width: 760px)").matches;
    if (prefersReducedMotion || !isMobileScreen) {
      swiper.autoplay.stop();
    }
  }
  /** Atualiza o story atual para refletir o gesto, o autoplay ou o progresso. */
  function handleSlideChange(swiper: SwiperInstance) {
    setActiveIndex(swiper.realIndex);
  }

  /** Guarda o ponto inicial do toque para reconhecer um gesto vertical. */
  function handleTouchStart(event: ReactTouchEvent<HTMLElement>) {
    const touch = event.changedTouches.item(0);
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  /** Abre o link do story quando o gesto vertical é um arraste para cima. */
  function handleTouchEnd(
    event: ReactTouchEvent<HTMLElement>,
    link: string | undefined,
  ) {
    const start = touchStartRef.current;
    const touch = event.changedTouches.item(0);
    touchStartRef.current = null;

    if (!start || !touch || !isSafeStoryLink(link)) return;
    if (event.target instanceof HTMLElement && event.target.closest("a")) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = start.y - touch.clientY;
    if (deltaY > 80 && deltaY > Math.abs(deltaX)) {
      window.location.assign(link);
    }
  }

  if (stories.length === 0) return null;

  const currentIndex = Math.min(activeIndex, stories.length - 1);

  return (
    <StorySection aria-labelledby="mobile-stories-title">
      <StoriesHeading>
        <StoriesIntro>
          <span>Da nossa oficina</span>
          <StoriesTitle id="mobile-stories-title">Ideias que ganham forma na serigrafia</StoriesTitle>
        </StoriesIntro>
        <Counter aria-live="polite">
          {String(currentIndex + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}
        </Counter>
      </StoriesHeading>

      <Viewer>
        <ProgressList aria-hidden="true">
          {stories.map((story, index) => (
            <ProgressTrack key={story.id}>
              <ProgressFill
                $state={index < currentIndex ? "complete" : index === currentIndex ? "active" : "upcoming"}
              />
            </ProgressTrack>
          ))}
        </ProgressList>

        <Swiper
          className="mobile-stories-swiper"
          role="region"
          aria-label="Stories da Brasil Gravações"
          direction="horizontal"
          modules={[Autoplay]}
          autoplay={stories.length > 1 ? {
            delay: STORY_DURATION_MS,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          } : false}
          slidesPerView={1}
          spaceBetween={12}
          loop={stories.length > 1}
          onSwiper={handleSwiper}
          onSlideChange={handleSlideChange}
        >
          {stories.map((story, index) => (
            <SwiperSlide key={story.id}>
              <StoryFrame
                onTouchStart={handleTouchStart}
                onTouchEnd={(event) => handleTouchEnd(event, story.link)}
              >
                <StoryVisual
                  story={story}
                  backgroundVariant={backgroundVariant}
                />
                <StoryCopy $centered={story.variant === "whatsapp"}>
                  {story.variant !== "whatsapp" && (
                    <StoryTitle>{limitStoryText(story.title)}</StoryTitle>
                  )}
                  <StoryDescription>{limitStoryText(story.description)}</StoryDescription>
                  {isSafeStoryLink(story.link) && (
                    <StorySwipeLink
                      href={story.link}
                      aria-label="Falar com a equipe pelo WhatsApp"
                    >
                      <small><FaWhatsapp /></small>
                    </StorySwipeLink>
                  )}
                </StoryCopy>
              </StoryFrame>
            </SwiperSlide>
          ))}
        </Swiper>
      </Viewer>
    </StorySection>
  );
}
