"use client";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import { useState } from "react";

type Banner = {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
};

const banners: Banner[] = [
  {
    id: "1",
    url: "https://api.koohnegar.com/media/52c4b247-c674-47cb-b2df-9d4edb4bfeb8.jpg",
    alt: "بنر۱",
    title: "بنر۱",
    buttonText: "مشاهده",
    buttonLink: "/ex",
  },
  {
    id: "2",
    url: "https://api.koohnegar.com/media/783bc83b-d653-45ba-b366-9de09da0fdda.jpg",
    alt: "بنر۲",
    title: "جدید ترین",
    buttonText: "خرید",
    buttonLink: "/news",
  },
  {
    id: "3",
    url: "https://api.koohnegar.com/media/c945877f-baa0-432d-a649-be56b80d4c40.jpg",
    alt: "/ex",
  },
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    rtl: true,
    slideChanged(s) {
      setCurrent(s.track.details.rel);
    },
  });

  return (
    <div className="w-full bg-white relative z-10">
      <div
        ref={sliderRef}
        className="keen-slider h-[200px] sm:h-[350px] lg:h-[420px] overflow-hidden rounded-b-3xl"
      >
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className="keen-slider__slide h-full w-full relative flex items-center justify-center"
          >
            <Image
              src={b.url}
              alt={b.alt || ""}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover select-none pointer-events-none"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/5 via-black/10 to-black/30" />
            {b.title && (
              <div className="absolute bottom-10 right-6 flex flex-col items-end gap-4 z-20">
                <h2 className="text-white font-extrabold text-2xl sm:text-4xl drop-shadow">
                  {b.title}
                </h2>
                {b.buttonText && (
                  <a
                    href={b.buttonLink}
                    className="bg-amber-400 hover:bg-amber-500 transition text-black px-5 py-2 rounded-lg font-bold"
                  >
                    {b.buttonText}
                    <span className="mr-1">&larr;</span>
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* نقاط اسلایدر */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-20">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => instanceRef.current?.moveToIdx(i)}
            aria-label={`slide-${i}`}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
