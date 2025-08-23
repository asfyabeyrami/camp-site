"use client";
import Image from "next/image";
import { useState } from "react";

type ProductImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export function ProductGallery({
  images,
  alt,
}: {
  images: ProductImage[];
  alt: string;
}) {
  const [currentImage, setCurrentImage] = useState(0);

  // اگر محصول هیچ عکسی نداشت
  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-xl p-3 w-full flex flex-col">
        <div className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
          <Image
            src="/noimg.png"
            alt={alt}
            width={340}
            height={340}
            className="object-contain w-full h-full"
            priority
            placeholder="empty"
            sizes="(max-width: 500px) 100vw, 340px"
          />
        </div>
      </div>
    );
  }

  const main = images[currentImage];
  const mainWidth = main.width || 600;
  const mainHeight = main.height || 600;

  return (
    <div className="bg-white rounded-xl p-3 w-full flex flex-col">
      {/* عکس بزرگ اصلی */}
      <div className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 animate-slideup">
        <Image
          src={main.src}
          alt={main.alt || alt}
          width={mainWidth}
          height={mainHeight}
          className="object-contain w-full h-full"
          quality={80}
          priority
          placeholder="empty"
          sizes="(max-width: 500px) 100vw, 340px"
          draggable={false}
        />
      </div>

      {/* نوار تصاویر کوچک پایین */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto max-w-full scrollbar-hide">
          {images.map((img, idx) => (
            <button
              type="button"
              key={img.src + "-thumb-" + idx}
              onClick={() => setCurrentImage(idx)}
              className={
                "rounded-md border focus:outline-none " +
                (currentImage === idx
                  ? "ring-2 ring-rose-400 border-rose-300"
                  : "border-gray-200")
              }
              tabIndex={0}
              aria-label={`تصویر ${idx + 1}${img.alt ? " " + img.alt : ""}`}
            >
              <Image
                src={img.src}
                alt={img.alt || alt}
                width={64}
                height={64}
                className="w-16 h-16 rounded-md object-contain"
                loading="lazy"
                draggable={false}
                quality={65}
                placeholder="empty"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
