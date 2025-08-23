import Image from "next/image";
import Link from "next/link";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type MediaItem = {
  id: string;
  alt?: string;
  media: {
    id: string;
    url: string;
    type: string;
  };
};

type Product = {
  id: string;
  code: number;
  name: string | { text: string };
  slug: string;
  isAvailable: boolean;
  count: number;
  price: number;
  off: number;
  description: { text: string } | string;
  media_item: MediaItem[];
};

/**
 * تبدیل حالت‌های مختلف name یا description به string
 */
function stringVal(
  input: string | { text: string } | undefined | null
): string {
  if (typeof input === "string") return input;
  if (input && typeof (input as { text?: unknown }).text === "string")
    return (input as { text: string }).text;
  return "";
}

/**
 * ساخت آدرس مدیا
 */
function getMediaUrl(media: { url: string }) {
  if (!media?.url) return "/noimg.png";
  if (media.url.startsWith("http")) return media.url;
  // اگر آدرس نسبی، آدرس api را اضافه کن
  return `${NEXT_PUBLIC_BASE_URL}/media/${media.url}`;
}

export default function ProductCard({ product }: { product: Product }) {
  // پردازش اطلاعات
  const name = stringVal(product.name);
  // اگر off یا price رشته بود، به عدد تبدیل کن (پشتیبانی از عدد و رشته)
  const off = Number(product.off) || 0;
  const price = Number(product.price) || 0;
  const finalPrice = price - Math.floor((price * off) / 100);

  // تصویر
  // همیشه اولویت با اولین عکس لیست یا noimg
  const mainItem =
    Array.isArray(product.media_item) && product.media_item.length > 0
      ? product.media_item[0]
      : undefined;
  const imageUrl = mainItem?.media ? getMediaUrl(mainItem.media) : "/noimg.png";
  const imageAlt = mainItem?.alt ? mainItem.alt : name;

  return (
    <article
      className={`
        bg-white rounded-2xl border border-gray-200
        flex flex-col h-full
        shadow-sm transition hover:shadow-md
        overflow-hidden w-full
      `}
    >
      <Link
        href={`/${product.slug}`}
        className="
          block w-full aspect-square bg-gray-50 rounded-2xl
          overflow-hidden relative group
        "
        aria-label={name}
        tabIndex={0}
      >
        <Image
          src={imageUrl}
          alt={imageAlt || "بدون عکس"}
          width={250}
          height={250}
          className="object-contain w-full h-full group-hover:scale-105 transition"
          priority
          quality={75}
          sizes="(max-width: 500px) 100vw, 250px"
          draggable={false}
          placeholder="empty"
        />
        {!product.isAvailable && (
          <span
            className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold rounded px-2 py-1 opacity-90"
            aria-label="ناموجود"
          >
            ناموجود
          </span>
        )}
      </Link>
      <div className="flex flex-col flex-1 items-start justify-between pt-4 px-3 pb-3">
        <h3
          className="font-bold text-base mb-1 leading-6 line-clamp-2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "40px",
            maxHeight: "44px",
          }}
        >
          <Link href={`/${product.slug}`} className="hover:text-rose-600">
            {name}
          </Link>
        </h3>
        <span className="text-slate-400 text-xs mt-1 mb-2 h-4">
          کد کالا: {product.code}
        </span>
        <div className="flex-1" />
        <div className="w-full flex flex-col items-end gap-1 mt-2">
          <span className="text-lg font-black text-rose-600 whitespace-nowrap">
            {finalPrice.toLocaleString()}
            <span className="text-xs ml-1">تومان</span>
          </span>
          {off > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold line-through text-gray-400 whitespace-nowrap">
                {price.toLocaleString()}
                <span className="text-xs mx-1">تومان</span>
              </span>
              <span className="bg-rose-600 text-white text-xs font-bold rounded px-2 py-1 flex items-center">
                {off}%
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
