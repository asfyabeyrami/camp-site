import Image from "next/image";
import Link from "next/link";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
  media_item: {
    id: string;
    alt?: string;
    media: { id: string; url: string; type: string };
  }[];
};

function stringVal(
  input: string | { text: string } | undefined | null
): string {
  if (typeof input === "string") return input;
  if (input && typeof (input as { text?: unknown }).text === "string")
    return (input as { text: string }).text;
  return "";
}

function getMediaUrl(media: { url: string } | undefined): string {
  if (!media?.url) return "/noimg.png";
  if (media.url.startsWith("http")) return media.url;
  return `${NEXT_PUBLIC_BASE_URL}/media/${media.url}`;
}

export default function ProductCardHome({ product }: { product: Product }) {
  const off = Number(product.off) || 0;
  const price = Number(product.price) || 0;
  const finalPrice = price - Math.floor((price * off) / 100);
  const productName = stringVal(product.name);
  const mainMediaItem = product.media_item?.[0];
  const imageUrl = mainMediaItem
    ? getMediaUrl(mainMediaItem.media)
    : "/noimg.png";
  const imageAlt = mainMediaItem?.alt || productName || "بدون تصویر";

  return (
    <article
      className="
        bg-white rounded-2xl border border-gray-200
        flex flex-col h-full
        shadow-sm transition hover:shadow-md
        overflow-hidden
      "
      style={{ minWidth: 210, maxWidth: 250, minHeight: 390, maxHeight: 460 }}
      itemScope
      itemType="https://schema.org/Product"
    >
      <Link
        href={`/product/${product.slug}`}
        className="
          block w-full aspect-square bg-gray-50 rounded-2xl
          overflow-hidden relative group
        "
        style={{ minHeight: 0, flexShrink: 0 }}
        aria-label={productName}
        tabIndex={0}
        itemProp="url"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={340}
          height={340}
          className="object-contain w-full h-full group-hover:scale-105 transition"
          loading="lazy"
          quality={75}
          sizes="(max-width: 500px) 100vw, 340px"
          itemProp="image"
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
        {/* نام محصول باید مستقیم (نه به صورت لینک) و فقط متن با itemProp="name" باشد */}
        <h3 className="font-bold text-base mb-1 leading-6 w-full">
          <Link
            href={`/product/${product.slug}`}
            className="hover:text-rose-600"
            itemProp="name"
          >
            <span itemProp="name">{productName}</span>
          </Link>
        </h3>
        <span className="text-slate-400 text-xs mt-1 mb-2 h-4">
          کد کالا: <span itemProp="sku">{product.code}</span>
        </span>
        <div className="flex-1"></div>

        {/* قیمت و آفر اسکیما */}
        <div className="w-full flex flex-col items-end gap-1 mt-2">
          <span
            className="text-lg font-black text-rose-600 whitespace-nowrap"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            {/* برای نمایش قیمت (فرندلی)، ولی مقدار اسکیما در meta */}
            <span>
              {finalPrice.toLocaleString()}
              <span className="text-xs ml-1">تومان</span>
            </span>
            <meta itemProp="price" content={finalPrice.toString()} />
            <meta itemProp="priceCurrency" content="IRR" />
            <meta
              itemProp="availability"
              content={
                product.isAvailable
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock"
              }
            />
            {/* اختیاری: priceValidUntil */}
            {/* <meta itemProp="priceValidUntil" content="2024-12-31" /> */}
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
