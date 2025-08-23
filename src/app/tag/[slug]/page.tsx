import ProductGridWithFilters from "@/components/category/ProductGridWithFilters";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import { Product } from "@/types/type";
import Link from "next/link";

// ====== Helper
function stringVal(
  input: string | { text?: string } | undefined | null
): string {
  if (typeof input === "string") return input;
  if (input && typeof (input as { text?: unknown }).text === "string")
    return (input as { text: string }).text;
  return "";
}

type TagRes = {
  id: string;
  title: string | { text: string };
  metaTitle?: string | { text: string };
  metaDescription?: string | { text: string };
  metaKeywords?: string | { text: string };
  ogTitle?: string | { text: string };
  ogDescription?: string | { text: string };
  canonicalUrl?: string | { text: string };
  description?: string | { text: string };
};
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// گرفتن جزییات تگ
async function getTag(slug: string): Promise<TagRes | null> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/tag/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { data } = await res.json();
  return data as TagRes;
}

// محصولات مربوط به تگ
async function getProducts(tagId: string): Promise<Product[]> {
  const res = await fetch(
    `${NEXT_PUBLIC_BASE_URL}/product/sort?tagId=${tagId}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const { data } = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

// =============== Metadata ===============
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) {
    return {
      title: "تگ یافت نشد",
      description: "برچسب مورد نظر وجود ندارد.",
    };
  }
  const metaTitle =
    stringVal(tag.metaTitle) ||
    stringVal(tag.ogTitle) ||
    stringVal(tag.title) ||
    "برچسب";
  const metaDescription =
    stringVal(tag.metaDescription) ||
    stringVal(tag.ogDescription) ||
    stringVal(tag.description) ||
    "";
  const canonicalUrl = stringVal(tag.canonicalUrl) || `/tag/${slug}`;
  const keywords = stringVal(tag.metaKeywords) || "";
  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords,
    openGraph: {
      title: stringVal(tag.ogTitle) || metaTitle,
      description: stringVal(tag.ogDescription) || metaDescription,
      type: "website",
      url: `https://pooladmotor.com${canonicalUrl}`,
      // images: ... اگر تصویر جدا داری اضافه کن
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// =============== اسکیما‌ Structured Data ===============
function buildTagPageSchema(tag: TagRes, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: stringVal(tag.title),
    description: stringVal(tag.description) || "",
    url: `https://pooladmotor.com/tag/${tag.id}`,
    hasPart: products.slice(0, 20).map((product) => ({
      "@type": "Product",
      name: product.name,
      image: product.media_item?.[0]?.media?.url
        ? product.media_item[0].media.url.startsWith("http")
          ? product.media_item[0].media.url
          : `${NEXT_PUBLIC_BASE_URL}/media/${product.media_item[0].media.url}`
        : undefined,
      sku: product.code,
      url: `https://pooladmotor.com/${product.slug}`,
      offers: {
        "@type": "Offer",
        price: Number(product.price) * 10,
        priceCurrency: "IRR",
        availability: product.isAvailable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        ...(product.count ? { inventoryLevel: product.count } : {}),
      },
    })),
  };
}

function buildTagBreadcrumbSchema(tag: TagRes) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "خانه",
        item: "https://pooladmotor.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: stringVal(tag.title),
        item: `https://pooladmotor.com/tag/${tag.id}`,
      },
    ],
  };
}

// --------- Main Page -----------
export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTag(slug);

  // تگ پیدا نشد
  if (!tag) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center">
          <div className="max-w-2xl m-auto py-20 text-center text-2xl text-gray-400">
            تگ مورد نظر یافت نشد!
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // محصولات اولیه مربوط به این تگ
  const initialProducts = await getProducts(tag.id);

  const tagSchema = buildTagPageSchema(tag, initialProducts);
  const breadcrumbSchema = buildTagBreadcrumbSchema(tag);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex flex-col items-center px-1 md:px-4 xl:px-6 py-8">
        <div className="w-full max-w-[1700px] mx-auto">
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(breadcrumbSchema),
            }}
          />
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(tagSchema),
            }}
          />
          {/* Breadcrumb */}
          <nav className="mb-4 px-4 text-sm font-semibold text-gray-600 flex flex-row gap-1 items-center">
            <Link href="/">خانه</Link>
            <span className="mx-1 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 18 18"
              >
                <path
                  d="M11.75 14.25L6.25 9L11.75 3.75"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-rose-600">{stringVal(tag.title)}</span>
          </nav>
          {/* عنوان تگ */}
          <section className="mb-6 px-4">
            <h1 className="font-extrabold text-2xl md:text-3xl mb-3 text-rose-600">
              {`${stringVal(tag.title)}`}
            </h1>
          </section>
          {/* لیست محصولات + سایدبار و سورت و ... مثل دسته‌بندی */}
          <ProductGridWithFilters
            tagId={tag.id}
            initialProducts={initialProducts}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
