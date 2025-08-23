"use client";
import { Product } from "@/types/type";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import { useRef } from "react";
import ProductCardHome from "./category/productCardHome";

export default function SaleProductsSlider({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const { clientWidth, scrollLeft } = ref.current;
    ref.current.scrollTo({
      left:
        dir === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full py-6 max-w-7xl mx-auto">
      {/* عنوان */}
      <h2 className="text-lg sm:text-xl font-extrabold text-rose-700 mb-4">
        {title}
      </h2>

      {/* اسلایدر */}
      <div className="relative">
        {/* دکمه چپ */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white shadow border border-rose-200 rounded-full hover:bg-rose-50 transition"
          aria-label="قبلی"
        >
          <ArrowLeftCircleIcon className="w-6 h-6 text-rose-700" />
        </button>

        {/* اسلایدر خود محصول‌ها */}
        <div
          ref={ref}
          className="grid grid-flow-col auto-cols-[minmax(220px,_1fr)] gap-3 overflow-x-auto scrollbar-hide scroll-smooth pr-1 pl-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {products.map((p) => (
            <ProductCardHome key={p.id} product={p} />
          ))}
        </div>
        {/* دکمه راست */}
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white shadow border border-rose-200 rounded-full hover:bg-rose-50 transition"
          aria-label="بعدی"
        >
          <ArrowRightCircleIcon className="w-6 h-6 text-rose-700" />
        </button>
      </div>
    </section>
  );
}
