'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EngravingMethodCard } from '@/components/engraving-method-card';
import type { EngravingMethod } from '@/components/engraving-method-card';

type EngravingMethodsCarouselProps = {
  methods: EngravingMethod[];
};

/** Exibe 1,2 cards no celular, 2,5 no tablet, 5,5 no desktop e até 8 em TVs. */
export function EngravingMethodsCarousel({ methods }: EngravingMethodsCarouselProps) {
  // Limita a quantidade visível ao total real para não deixar espaços vazios no carrossel.
  const availableSlides = Math.max(methods.length, 1);

  return (
    <Swiper
      role="region"
      aria-label="Técnicas de gravação"
      aria-roledescription="carrossel"
      slidesPerView={Math.min(1.2, availableSlides)}
      spaceBetween={12}
      grabCursor
      watchOverflow
      breakpoints={{
        640: { slidesPerView: Math.min(2.5, availableSlides), spaceBetween: 16 },
        1024: { slidesPerView: Math.min(5.5, availableSlides), spaceBetween: 20 },
        1920: { slidesPerView: Math.min(8, availableSlides), spaceBetween: 24 },
      }}
    >
      {methods.map((method) => (
        <SwiperSlide key={method.slug}>
          <EngravingMethodCard method={method} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
