"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";

export type Category = {
  id: string;
  title: string;
  slug: string;
  image: string;
};

export default function CategorySlider({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const { scrollLeft, clientWidth } = ref.current;
    ref.current.scrollTo({
      left:
        dir === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full py-6 max-w-7xl mx-auto">
      {/* دکمه چپ راست فقط دسکتاپ */}
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-blue-200 shadow rounded-full p-1"
        aria-label="قبلی"
      >
        <ArrowLeftCircleIcon className="w-6 h-6 text-rose-700" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-blue-200 shadow rounded-full p-1"
        aria-label="بعدی"
      >
        <ArrowRightCircleIcon className="w-6 h-6 text-rose-700" />
      </button>

      {/* لیست دسته‌بندی‌ها */}
      <div
        ref={ref}
        className="flex gap-2 sm:gap-6 overflow-x-auto overflow-y-hidden px-2 sm:px-8 scrollbar-hide scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col items-center min-w-[82px] sm:min-w-[110px] cursor-pointer transition hover:scale-105"
            onClick={() => router.push(`/${cat.slug}`)}
            title={cat.title}
          >
            <div className="rounded-full border-2 border-blue-300 shadow-md p-1 sm:p-2 w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] flex items-center justify-center bg-white">
              <Image
                src={cat.image}
                alt={cat.title}
                width={80}
                height={80}
                className="object-contain rounded-full"
              />
            </div>
            <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700 text-center">
              {cat.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
