"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay } from "swiper/modules";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { STORY_BACKGROUND_VARIANT_COUNT } from "@/lib/story-atmosphere";
import {
  SCounter,
  SProgressList,
  SProgressFill,
  SProgressTrack,
  SStoryCopy,
  SStoryDescription,
  SStoryFrame,
  SStoryAtmosphere,
  SStoryImageLayer,
  SStorySection,
  SStorySwipeLink,
  SStoryTextBody,
  SStoryTextCanvas,
  SStoryTextMark,
  SStoryTitle,
  SStoryVideo,
  STextDecoration,
  SStoriesHeading,
  SStoriesIntro,
  SStoriesTitle,
  SViewer,
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
  backgroundVariant?: number;
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
      <SStoryTextCanvas
        $tone={story.media.tone ?? "navy"}
        $hasBackground={story.variant === "whatsapp"}
      >
        {story.variant === "whatsapp" && (
          <SStoryAtmosphere
            $variant={backgroundVariant}
            aria-hidden="true"
            data-story-background=""
          />
        )}
        {story.variant !== "whatsapp" && <STextDecoration aria-hidden="true" />}
        <SStoryTextMark>BRASIL GRAVAÇÕES</SStoryTextMark>
        <SStoryTextBody type="paragraph" size="xxl" weight={600}>
          {limitStoryText(story.media.content)}
        </SStoryTextBody>
      </SStoryTextCanvas>
    );
  }

  if (!isSafeMediaSource(story.media.src)) {
    return (
      <SStoryTextCanvas $tone="navy">
        <SStoryTextBody type="paragraph" size="xxl" weight={600}>
          Mídia indisponível
        </SStoryTextBody>
      </SStoryTextCanvas>
    );
  }

  if (story.media.type === "video") {
    const poster = story.media.poster && isSafeMediaSource(story.media.poster)
      ? story.media.poster
      : undefined;

    return (
      <SStoryVideo
        aria-label={story.title}
        controls
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={story.media.src} />
        Seu navegador não oferece suporte a este vídeo.
      </SStoryVideo>
    );
  }

  return (
    <SStoryImageLayer>
      <Image
        src={story.media.src}
        alt={story.media.alt}
        fill
        sizes="(max-width: 760px) 100vw, 480px"
        unoptimized
        loading="lazy"
      />
    </SStoryImageLayer>
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
  const [randomBackgroundVariant, setRandomBackgroundVariant] = useState<number | null>(null);

  /** Sorteia somente depois da hidratação para manter o HTML inicial igual no servidor e cliente. */
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setRandomBackgroundVariant(
        Math.floor(Math.random() * STORY_BACKGROUND_VARIANT_COUNT),
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

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
  const resolvedBackgroundVariant = backgroundVariant ?? randomBackgroundVariant ?? 0;

  return (
    <SStorySection aria-labelledby="mobile-stories-title">
      <SStoriesHeading>
        <SStoriesIntro>
          <span>Da nossa oficina</span>
          <SStoriesTitle
            type="title"
            headingLevel="h2"
            size="md"
            weight={700}
            id="mobile-stories-title"
          >
            Ideias que ganham forma na serigrafia
          </SStoriesTitle>
        </SStoriesIntro>
        <SCounter aria-live="polite">
          {String(currentIndex + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}
        </SCounter>
      </SStoriesHeading>

      <SViewer>
        <SProgressList aria-hidden="true">
          {stories.map((story, index) => (
            <SProgressTrack key={story.id}>
              <SProgressFill
                $state={index < currentIndex ? "complete" : index === currentIndex ? "active" : "upcoming"}
              />
            </SProgressTrack>
          ))}
        </SProgressList>

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
          {stories.map((story) => (
            <SwiperSlide key={story.id}>
              <SStoryFrame
                onTouchStart={handleTouchStart}
                onTouchEnd={(event) => handleTouchEnd(event, story.link)}
              >
                <StoryVisual
                  story={story}
                  backgroundVariant={resolvedBackgroundVariant}
                />
                <SStoryCopy $centered={story.variant === "whatsapp"}>
                  {story.variant !== "whatsapp" && (
                    <SStoryTitle type="title" headingLevel="h3" size="sm" weight={700}>
                      {limitStoryText(story.title)}
                    </SStoryTitle>
                  )}
                  <SStoryDescription type="paragraph" size="md" weight={400}>
                    {limitStoryText(story.description)}
                  </SStoryDescription>
                  {isSafeStoryLink(story.link) && (
                    <SStorySwipeLink
                      href={story.link}
                      aria-label="Falar com a equipe pelo WhatsApp"
                    >
                      <small><FaWhatsapp /></small>
                    </SStorySwipeLink>
                  )}
                </SStoryCopy>
              </SStoryFrame>
            </SwiperSlide>
          ))}
        </Swiper>
      </SViewer>
    </SStorySection>
  );
}
