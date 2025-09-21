import ProductGridWithFilters from "@/components/category/ProductGridWithFilters";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import Link from "next/link";

import type { CategoryRes, Product } from "@/types/type";
import { notFound } from "next/navigation";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function buildCategorySchema(category: CategoryRes, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description,
    url: `https://koohnegar.com/${category.slug}`,
    hasPart: products.slice(0, 20).map((product) => ({
      "@type": "Product",
      name: product.name,
      image: product.media_item?.[0]?.media?.url
        ? product.media_item[0].media.url.startsWith("http")
          ? product.media_item[0].media.url
          : `${NEXT_PUBLIC_BASE_URL}/media/${product.media_item[0].media.url}`
        : undefined,
      sku: product.code,
      url: `https://koohnegar.com/product/${product.slug}`,
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

// -- Helpers
function stringVal(
  input: string | { text: string } | undefined | null
): string {
  if (typeof input === "string") return input;
  if (input && typeof (input as { text?: unknown }).text === "string")
    return (input as { text: string }).text;
  return "";
}

async function getCategory(slug: string): Promise<CategoryRes | null> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/category/slug/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  const { data } = await res.json();
  return data as CategoryRes;
}

async function getAllCategories(): Promise<CategoryRes[]> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/category`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const { data } = await res.json();
  return Array.isArray(data) ? (data as CategoryRes[]) : [];
}

function flattenCategories(categories: CategoryRes[]): CategoryRes[] {
  const flat: CategoryRes[] = [];
  function recur(cats: CategoryRes[]) {
    for (const cat of cats) {
      flat.push(cat);
      if (Array.isArray(cat.children) && cat.children.length > 0) {
        recur(cat.children);
      }
    }
  }
  recur(categories);
  return flat;
}
function buildCategoryPath(
  allCats: CategoryRes[],
  cat: CategoryRes
): CategoryRes[] {
  const path: CategoryRes[] = [];
  let current: CategoryRes | undefined = cat;
  while (current) {
    path.unshift(current);
    current = current.fatherId
      ? allCats.find((c) => c.id === current!.fatherId)
      : undefined;
  }
  return path;
}

// محصولات دسته برای SSR اولیه
async function getProducts({ categoryId }: { categoryId: string }) {
  const url = `${NEXT_PUBLIC_BASE_URL}/product/sort?categoryId=${categoryId}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const { data } = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

// Metadata = سئو بهبود یافته
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getCategory(slug);
  if (category) {
    const metaTitle =
      stringVal(category.metaTitle) ||
      stringVal(category.ogTitle) ||
      stringVal(category.title) ||
      "دسته بندی";
    const metaDescription =
      stringVal(category.metaDescription) ||
      stringVal(category.ogDescription) ||
      stringVal(category.description) ||
      "";
    const canonicalUrl =
      stringVal(category.canonicalUrl) || `https://koohnegar.com/${slug}`;
    // OpenGraph Image
    const ogImage =
      category.structuredData && category.structuredData.image
        ? Array.isArray(category.structuredData.image)
          ? category.structuredData.image.map((url: string) => ({ url }))
          : [{ url: category.structuredData.image }]
        : undefined;
    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: stringVal(category.ogTitle) || metaTitle,
        description: stringVal(category.ogDescription) || metaDescription,
        type: "website",
        url: canonicalUrl,
        images: ogImage,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return {
    title: "محصول یا دسته مورد نظر یافت نشد",
    description: "اطلاعاتی یافت نشد",
  };
}

// ---- MAIN PAGE ----
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // اول بررسی کن دسته هست؟
  const category = await getCategory(slug);

  if (category) {
    const nestedCategories = await getAllCategories();
    const allCategories = flattenCategories(nestedCategories);
    const path = buildCategoryPath(allCategories, category);
    const initialProducts = await getProducts({ categoryId: category.id });
    const descriptionText = stringVal(category.description);

    // SEO Structred Data: Breadcrumbs
    const breadcrumbStructured = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "خانه",
          item: "https://koohnegar.com/",
        },
        ...path.map((item, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: stringVal(item.title),
          item: `https://koohnegar.com/${encodeURIComponent(
            stringVal(item.slug)
          )}`,
        })),
      ],
    };
    const categorySchema = buildCategorySchema(category, initialProducts);
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex flex-col items-center px-1 md:px-4 xl:px-6 py-8">
          <div className="w-full max-w-[1700px] mx-auto">
            {/* STRUCTURED DATA FOR BREADCRUMB */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(breadcrumbStructured),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(categorySchema),
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
              {path.map((cat, idx) =>
                idx !== path.length - 1 ? (
                  <span key={cat.id} className="flex items-center">
                    <Link
                      href={`/${encodeURIComponent(stringVal(cat.slug))}`}
                      className="hover:text-rose-500 transition"
                    >
                      {stringVal(cat.title)}
                    </Link>
                    <span className="mx-1">
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
                    </span>
                  </span>
                ) : (
                  <span key={cat.id} className="text-rose-600">
                    {stringVal(cat.title)}
                  </span>
                )
              )}
            </nav>
            <section className="mb-6 px-4">
              <h1 className="font-extrabold text-2xl md:text-3xl mb-3 text-rose-600">
                {category?.title ? `${stringVal(category.title)}` : ""}
              </h1>
            </section>
            <ProductGridWithFilters
              categoryId={category.id}
              initialProducts={initialProducts}
            />
            {/* توضیحات دسته */}
            {descriptionText && descriptionText.trim().length > 0 && (
              <section className="w-full max-w-[1700px] mx-auto bg-white rounded-2xl px-4 py-6 flex flex-col gap-8 ">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700 text-base leading-relaxed pb-10">
                  <h3 className="font-bold text-lg text-gray-800 mb-5 mt-5 mr-4 ml-4">
                    توضیحات
                  </h3>
                  <div
                    className="text-[#888888] leading-[2.2] mx-4"
                    dangerouslySetInnerHTML={{ __html: descriptionText }}
                  />
                </div>
              </section>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  notFound();
}
