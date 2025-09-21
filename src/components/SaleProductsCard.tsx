import { Product } from "@/types/type";
import Link from "next/link";
import Image from "next/image";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function SaleProductCard({ product }: { product: Product }) {
  const img = product.media_item?.[0]?.media?.url
    ? `${NEXT_PUBLIC_BASE_URL}/media/${product.media_item[0].media.url}`
    : "/images/no-image.webp";
  const finalPrice =
    product.price - Math.floor((product.price * product.off) / 100);
  const discount = product.off || 0;
  return (
    <div
      className="border border-gray-200 rounded-2xl
      flex flex-col items-center px-1 sm:px-2
      min-w-[70vw] max-w-[77vw]
      sm:min-w-[200px] sm:max-w-[230px] md:min-w-[200px] md:max-w-[230px]
      "
    >
      <div className="w-full mb-3" />
      <Link
        href={`/product/${encodeURIComponent(product.slug)}`}
        className="w-full flex flex-col items-center"
      >
        <Image
          src={img}
          alt={product.name}
          width={96}
          height={96}
          className="w-[76px] h-[76px] sm:w-24 sm:h-24 object-contain mx-auto"
          loading="lazy"
          draggable={false}
        />
        <div className="mt-2 text-xs sm:text-sm text-center leading-6 min-h-[2.9rem] line-clamp-2 font-vazir">
          {product.name}
        </div>
      </Link>
      <div className="flex flex-row items-end gap-2 justify-center w-full mt-4 mb-1">
        <span className="text-base md:text-lg font-extrabold text-gray-800">
          {finalPrice.toLocaleString()}{" "}
          <span className="text-xs font-bold">تومان</span>
        </span>
        {discount > 0 && (
          <span className="bg-rose-600 text-white text-xs font-bold rounded px-2 py-1 flex items-center h-7">
            {discount}%
          </span>
        )}
      </div>
      <div className="text-slate-400 text-xs line-through text-center w-full mb-1">
        {product.price.toLocaleString()} تومان
      </div>
    </div>
  );
}
